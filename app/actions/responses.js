/* eslint-env browser*/
import _ from 'underscore';
import pathwaysActions from './pathways';
import rootRef from '../libs/firebase';
import { hashToCollection } from '../libs/hashToCollection.js';
import request from 'request';
import objectWithSnakeKeysFromCamel from '../libs/objectWithSnakeKeysFromCamel';

const C = require('../constants').default;
const moment = require('moment');
const responsesRef = rootRef.child('responses');

export function deleteStatus(questionId) {
  return { type: C.DELETE_RESPONSE_STATUS, data: { questionId, }, };
}

export function updateStatus(questionId, status) {
  return { type: C.UPDATE_RESPONSE_STATUS, data: { questionId, status, }, };
}

export function updateData(questionId, responses) {
  return { type: C.UPDATE_RESPONSE_DATA, data: { questionId, responses, }, };
}

function responsesForQuestionRef(questionId) {
  return responsesRef.orderByChild('questionUID').equalTo(questionId);
}

function getQuestionLoadedStatusForGroupedResponses(groupedResponses) {
  const questionsKeys = _.keys(groupedResponses);
  const statuses = {};
  questionsKeys.forEach((key) => {
    statuses[key] = 'LOADED';
  });
  console.log(statuses);
  return statuses;
}

function groupResponsesByQuestion(snapshot) {
  const groupedResponses = {};
  for (const responseKey in snapshot) {
    if (snapshot.hasOwnProperty(responseKey)) {
      const response = snapshot[responseKey];
      if (response.questionUID) {
        if (groupedResponses[response.questionUID]) {
          groupedResponses[response.questionUID][responseKey] = response;
        } else {
          groupedResponses[response.questionUID] = {};
          groupedResponses[response.questionUID][responseKey] = response;
        }
      }
    }
  }
  return groupedResponses;
}

export function loadAllResponseData() {
  return (dispatch) => {
    responsesRef.once('value', (snapshot) => {
      const data = groupResponsesByQuestion(snapshot.val());
      const status = getQuestionLoadedStatusForGroupedResponses(data);
      dispatch({ type: 'BULK UPDATE', data: { data, status, }, });
    });
  };
}

export function loadResponseData(questionId) {
  return (dispatch) => {
    // dispatch(updateStatus(questionId, 'LOADING'));
    responsesForQuestionRef(questionId).once('value', (snapshot) => {
      dispatch(updateData(questionId, snapshot.val()));
      // dispatch(updateStatus(questionId, 'LOADED'));
    });
  };
}

export function loadMultipleResponses(arrayOfQuestionIDs, cb) {
  return (dispatch) => {
    const newValues = {};
    const it = makeIterator(arrayOfQuestionIDs);
    const firstID = it.next().value;
    const doneTask = (newResponseData) => {
      dispatch({ type: 'BULK UPDATE', data: { data: newResponseData, status: {}, }, });
      cb();
    };
    loadResponseDataAndCallback(firstID, newValues, it, doneTask);
  };
}

function loadResponseDataAndCallback(questionId, dataHash, iterator, cb) {
  if (questionId === undefined) {
    cb(dataHash);
  } else {
    responsesForQuestionRef(questionId).once('value', (snapshot) => {
      dataHash[questionId] = snapshot.val();
      loadResponseDataAndCallback(iterator.next().value, dataHash, iterator, cb);
    });
  }
}

export function loadResponseDataAndListen(questionId) {
  return (dispatch) => {
    dispatch(updateStatus(questionId, 'LOADING'));
    responsesForQuestionRef(questionId).on('value', (snapshot) => {
      dispatch(updateData(questionId, snapshot.val()));
      dispatch(updateStatus(questionId, 'LOADED'));
    });
  };
}

export function stopListeningToResponses(questionId) {
  return () => {
    responsesForQuestionRef(questionId).off('value');
  };
}

export function submitResponse(content, prid, isFirstAttempt) {
  delete content.gradeIndex;
  const rubyConvertedResponse = objectWithSnakeKeysFromCamel(content);
  rubyConvertedResponse.created_at = moment().format('x');
  rubyConvertedResponse.first_attempt_count = isFirstAttempt ? 1 : 0;
  rubyConvertedResponse.is_first_attempt = isFirstAttempt;
  return (dispatch) => {
    request.post({
      url: `${process.env.QUILL_CMS}/responses/create_or_increment`,
      form: { response: rubyConvertedResponse, }, },
      (error, httpStatus, body) => {
        if (error) {
          dispatch({ type: C.DISPLAY_ERROR, error: `Submission failed! ${error}`, });
        } else if (httpStatus.statusCode === 204 || httpStatus.statusCode === 200) {
          dispatch({ type: C.DISPLAY_MESSAGE, message: 'Submission successfully saved!', });
        } else {
          console.log(body);
        }
      },
    );
  };
}

export function submitMassEditFeedback(ids, feedback, qid) {
  return (dispatch) => {
    request.put({
      url: `${process.env.QUILL_CMS}/responses/mass_edit/feedback`,
      json: { ids, feedback, }, },
      (error, httpStatus, body) => {
        if (error) {
          dispatch({ type: C.DISPLAY_ERROR, error: `Submission failed! ${error}`, });
        } else if (httpStatus.statusCode === 204 || httpStatus.statusCode === 200) {
          dispatch({ type: C.DISPLAY_MESSAGE, message: 'Submission successfully saved!', });
          dispatch({ type: C.SHOULD_RELOAD_RESPONSES, qid, });
        } else {
          console.log(body);
        }
      });
  };
}

export function submitMassEditConceptResults(ids, conceptResults, qid) {
  return (dispatch) => {
    request.put({
      url: `${process.env.QUILL_CMS}/responses/mass_edit/concept_results`,
      json: { ids, conceptResults, }, },
      (error, httpStatus, body) => {
        if (error) {
          dispatch({ type: C.DISPLAY_ERROR, error: `Submission failed! ${error}`, });
        } else if (httpStatus.statusCode === 204 || httpStatus.statusCode === 200) {
          dispatch({ type: C.DISPLAY_MESSAGE, message: 'Submission successfully saved!', });
          dispatch({ type: C.SHOULD_RELOAD_RESPONSES, qid, });
        } else {
          console.log(body);
        }
      });
  };
}

export function massEditDeleteResponses(ids, qid) {
  return (dispatch) => {
    request.post({
      url: `${process.env.QUILL_CMS}/responses/mass_edit/delete`,
      json: { ids, }, },
      (error, httpStatus, body) => {
        if (error) {
          dispatch({ type: C.DISPLAY_ERROR, error: `Submission failed! ${error}`, });
        } else if (httpStatus.statusCode === 204 || httpStatus.statusCode === 200) {
          dispatch({ type: C.DISPLAY_MESSAGE, message: 'Submission successfully saved!', });
          dispatch({ type: C.SHOULD_RELOAD_RESPONSES, qid, });
        } else {
          console.log(body);
        }
      });
  };
}

export function submitResponseEdit(rid, content, qid) {
  const rubyConvertedResponse = objectWithSnakeKeysFromCamel(content);
  return (dispatch) => {
    request.put({
      url: `${process.env.QUILL_CMS}/responses/${rid}`,
      form: { response: rubyConvertedResponse, }, },
      (error, httpStatus, body) => {
        if (error) {
          dispatch({ type: C.DISPLAY_ERROR, error: `Submission failed! ${error}`, });
        } else if (httpStatus.statusCode === 204 || httpStatus.statusCode === 200) {
          dispatch({ type: C.DISPLAY_MESSAGE, message: 'Submission successfully saved!', });
          dispatch({ type: C.SHOULD_RELOAD_RESPONSES, qid, });
        } else {
          console.log(body);
        }
      });
  };
}

export function deleteResponse(qid, rid) {
  return (dispatch) => {
    request.delete(
      `${process.env.QUILL_CMS}/responses/${rid}`,
      (error, httpStatus, body) => {
        if (error) {
          dispatch({ type: C.DISPLAY_ERROR, error: `Submission failed! ${error}`, });
        } else if (httpStatus.statusCode === 204 || httpStatus.statusCode === 200) {
          dispatch({ type: C.DISPLAY_MESSAGE, message: 'Submission successfully saved!', });
          dispatch({ type: C.SHOULD_RELOAD_RESPONSES, qid, });
        } else {
          console.log(body);
        }
      },
    );
  };
}

export function setUpdatedResponse(rid, content) {
  return (dispatch) => {
    responsesRef.child(rid).set(content, (error) => {
      if (error) {
        dispatch({ type: C.DISPLAY_ERROR, error: `Update failed! ${error}`, });
      } else {
        dispatch({ type: C.DISPLAY_MESSAGE, message: 'Update successfully saved!', });
      }
    });
  };
}

export function incrementFirstAttemptCount(rid) {
  return (dispatch) => {
    responsesRef.child(`${rid}/firstAttemptCount`).transaction(currentCount => currentCount + 1, (error) => {
      if (error) {
        dispatch({ type: C.DISPLAY_ERROR, error: `increment failed! ${error}`, });
      } else {
        dispatch({ type: C.DISPLAY_MESSAGE, message: 'first attempt count successfully incremented!', });
      }
    });
  };
}

export function incrementResponseCount(qid, rid, prid, isFirstAttempt) {
  return (dispatch) => {
    const responseRef = responsesRef.child(rid);
    responseRef.child('/count').transaction(currentCount => currentCount + 1, (error) => {
      if (error) {
        dispatch({ type: C.DISPLAY_ERROR, error: `increment failed! ${error}`, });
      } else {
        dispatch(pathwaysActions.submitNewPathway(rid, prid, qid));
        dispatch({ type: C.DISPLAY_MESSAGE, message: 'Response successfully incremented!', });
        if (isFirstAttempt) {
          dispatch(incrementFirstAttemptCount(rid));
        }
      }
    });
    responseRef.child('parentID').once('value', (snap) => {
      if (snap.val()) {
        dispatch(incrementChildResponseCount(snap.val()));
      }
    });
  };
}

export function incrementChildResponseCount(rid) {
  return (dispatch) => {
    responsesRef.child(`${rid}/childCount`).transaction(currentCount => currentCount + 1, (error) => {
      if (error) {
        dispatch({ type: C.DISPLAY_ERROR, error: `increment failed! ${error}`, });
      } else {
        dispatch({ type: C.DISPLAY_MESSAGE, message: 'Child Response successfully incremented!', });
      }
    });
  };
}

export function removeLinkToParentID(rid) {
  return (dispatch) => {
    responsesRef.child(`${rid}/parentID`).remove((error) => {
      if (error) {
        dispatch({ type: C.DISPLAY_ERROR, error: `Deletion failed! ${error}`, });
      } else {
        dispatch({ type: C.DISPLAY_MESSAGE, message: 'Response successfully deleted!', });
      }
    });
  };
}

function makeIterator(array) {
  let nextIndex = 0;

  return {
    next() {
      return nextIndex < array.length ?
               { value: array[nextIndex++], done: false, } :
               { done: true, };
    },
  };
}

export function getResponsesWithCallback(questionID, callback) {
  responsesForQuestionRef(questionID).once('value', (snapshot) => {
    callback(snapshot.val());
    console.log('Loaded responses for ', questionID);
  });
}

export function listenToResponsesWithCallback(questionID, callback) {
  responsesForQuestionRef(questionID).on('value', (snapshot) => {
    callback(snapshot.val());
    console.log('Listened to responses for ', questionID);
  });
}

function gradedResponsesForQuestionRef(questionId) {
  return responsesRef.orderByChild('gradeIndex').equalTo(`human${questionId}`);
}

export function getGradedResponsesWithCallback(questionID, callback) {
  request(`${process.env.QUILL_CMS}/questions/${questionID}/responses`, (error, response, body) => {
    if (error) {
      console.log('error:', error); // Print the error if one occurred
    }
    const bodyToObj = {};
    JSON.parse(body).forEach((resp) => {
      bodyToObj[resp.id] = resp;
      if (typeof resp.concept_results === 'string') {
        resp.concept_results = JSON.parse(resp.concept_results);
      }
      for (const cr in resp.concept_results) {
        const formatted_cr = {};
        formatted_cr.conceptUID = cr;
        formatted_cr.correct = resp.concept_results[cr];
        resp.concept_results[cr] = formatted_cr;
      }
    });
    callback(bodyToObj);
  });
}

export function findResponseByText(text, questionUID, cb) {
  responsesRef.orderByChild('text').equalTo(text).once('value', (snapshot) => {
    const response = _.findWhere(hashToCollection(snapshot.val()), { questionUID, });
    cb(response);
  });
}
