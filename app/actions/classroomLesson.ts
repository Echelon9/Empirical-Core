declare function require(name:string);
import  C from '../constants';
import rootRef, { firebase } from '../libs/firebase';
const classroomLessonsRef = rootRef.child('classroom_lessons');
const reviewsRef = rootRef.child('reviews');
const editionMetadataRef = rootRef.child('lesson_edition_metadata');
import _ from 'lodash'
import * as IntF from 'components/classroomLessons/interfaces';
import * as CustomizeIntF from 'app/interfaces/customize'

import lessonBoilerplate from '../components/classroomLessons/shared/classroomLessonBoilerplate'
import lessonSlideBoilerplates from '../components/classroomLessons/shared/lessonSlideBoilerplates'
import scriptItemBoilerplates from '../components/classroomLessons/shared/scriptItemBoilerplates'

export function getClassLessonFromFirebase(classroomLessonUid: string) {
  console.log('getting a lesson')
  return function (dispatch) {
    console.log("Fetching")
    classroomLessonsRef.child(classroomLessonUid).on('value', (snapshot) => {
      console.log("Fetched")
      if (snapshot.val()) {
        dispatch(updateClassroomLesson(snapshot.val()));
        dispatch(setLessonId(classroomLessonUid))
      } else {
        dispatch({type: C.NO_LESSON_ID, data: classroomLessonUid})
      }
    });
  };
}

export function getEditionFromFirebase(editionUid: string) {
  console.log('getting an edition')
  return function (dispatch) {
    console.log("Fetching")
    editionMetadataRef.child(editionUid).on('value', (snapshot) => {
      console.log("Fetched")
      if (snapshot.val()) {
        dispatch(updateClassroomLesson(snapshot.val().data));
        dispatch(setLessonId(editionUid))
      } else {
        dispatch({type: C.NO_LESSON_ID, data: editionUid})
      }
    });
  };
}

export function updateClassroomLesson(data) {
  return {
    type: C.RECEIVE_CLASSROOM_LESSON_DATA,
    data,
  }
}

export function setLessonId(id:string) {
  return {
    type: C.SET_LESSON_ID,
    id
  }
}

export function listenForClassroomLessonsFromFirebase() {
  return function (dispatch) {
    classroomLessonsRef.on('value', (snapshot) => {
      if (snapshot.val()) {
        dispatch(updateClassroomLessons(snapshot.val()))
      } else {
        dispatch({type: C.NO_LESSONS})
      }
    })
  }
}

export function listenForclassroomLessonsReviewsFromFirebase() {
  return function (dispatch) {
    reviewsRef.on('value', (snapshot) => {
      if (snapshot.val()) {
        dispatch(updateClassroomLessonsReviews(snapshot.val()))
      }
    })
  }
}

export function updateClassroomLessons(data) {
  return ({type: C.RECEIVE_CLASSROOM_LESSONS_DATA, data: data})
}

export function updateClassroomLessonsReviews(data) {
  const reviewsGroupedByClassroomLessonId = {}
  const classroomActivityIds = Object.keys(data)
  classroomActivityIds.forEach((ca_id) => {
    const review = data[ca_id]
    const lessonId = review.activity_id
    if (reviewsGroupedByClassroomLessonId[lessonId]) {
      reviewsGroupedByClassroomLessonId[lessonId][ca_id] = review
    } else {
      reviewsGroupedByClassroomLessonId[lessonId] = { [ca_id]: review }
    }
  })
  return ({type: C.RECEIVE_CLASSROOM_LESSONS_REVIEW_DATA, data: reviewsGroupedByClassroomLessonId})
}

export function addSlide(editionUid: string, edition: CustomizeIntF.Edition, slideType: string, cb:Function|undefined) {
  const editionRef = editionMetadataRef.child(editionUid);
  const newEdition: CustomizeIntF.Edition = _.merge({}, edition)
  const newSlide: IntF.Question = lessonSlideBoilerplates[slideType]
  newEdition.data.questions.splice(-1, 0, newSlide)
  editionRef.set(newEdition);
  if (cb) {
    cb(Number(newEdition.data.questions.length) - 2)
  }
}

export function deleteEditionSlide(editionID, slideID, slides) {
  const slidesRef = editionMetadataRef.child(`${editionID}/data/questions/`)
  const newArray = _.compact(Object.keys(slides).map(slideKey => {
    if (slideKey != slideID ) {
      return slides[slideKey]
    }
  }))
  slidesRef.set(newArray);
}

export function addScriptItem(editionID: string, slideID: string, slide: IntF.Question, scriptItemType: string, cb: Function|undefined) {
  const newSlide = _.merge({}, slide)
  newSlide.data.teach.script.push(scriptItemBoilerplates[scriptItemType])
  const slideRef = editionMetadataRef.child(`${editionID}/data/questions/${slideID}`)
  slideRef.set(newSlide)
  if (cb) {
    cb(newSlide.data.teach.script.length - 1)
  }
}

export function deleteScriptItem(editionID, slideID, scriptItemID, script) {
  const scriptRef = editionMetadataRef.child(`${editionID}/data/questions/${slideID}/data/teach/script`)
  const newArray = _.compact(Object.keys(script).map(scriptKey => {
    if (scriptKey != scriptItemID ) {
      return script[scriptKey]
    }
  }))
  scriptRef.set(newArray);
}

export function addLesson(lessonName, cb) {
  const newLesson = lessonBoilerplate(lessonName)
  const newLessonKey = classroomLessonsRef.push().key
  classroomLessonsRef.child(newLessonKey).set(newLesson)
  if (cb) {
    cb(newLessonKey)
  }
}

export function saveEditionSlide(editionID, slideID, slideData, cb) {
  editionMetadataRef
    .child(`${editionID}/data/questions/${slideID}/data`)
    .set(slideData)
  if (cb) {
    cb()
  }
}

export function saveEditionScriptItem(editionID, slideID, scriptItemID, scriptItem, cb) {
  editionMetadataRef
    .child(`${editionID}/data/questions/${slideID}/data/teach/script/${scriptItemID}/`)
    .set(scriptItem)
  if (cb) {
    cb()
  }
}

export function deleteLesson(classroomLessonID) {
  classroomLessonsRef.child(classroomLessonID).remove();
}

export function deleteEdition(editionID) {
  editionMetadataRef.child(editionID).remove();
}

export function updateSlideScriptItems(editionID, slideID, scriptItems) {
  editionMetadataRef
    .child(`${editionID}/data/questions/${slideID}/data/teach/script/`)
    .set(scriptItems)
}

export function updateEditionSlides(editionID, slides) {
  editionMetadataRef
    .child(`${editionID}/data/questions/`)
    .set(slides)
}

export function updateClassroomLessonDetails(classroomLessonID, classroomLesson) {
  classroomLessonsRef.child(classroomLessonID).set(classroomLesson)
}

export function updateEditionDetails(editionID, edition) {
  editionMetadataRef.child(editionID).set(edition)
}

export function clearClassroomLessonFromStore() {
  return ({type: C.CLEAR_CLASSROOM_LESSON_DATA})
}
