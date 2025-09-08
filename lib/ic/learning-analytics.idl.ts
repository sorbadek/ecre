// @ts-nocheck
import { IDL } from '@dfinity/candid';

export const idlFactory = ({ IDL }: { IDL: any }) => {
  const Result = IDL.Variant({ ok: IDL.Text, err: IDL.Text });
  const LearningSession = IDL.Record({
    'id': IDL.Text,
    'userId': IDL.Principal,
    'contentId': IDL.Text,
    'contentType': IDL.Text,
    'startTime': IDL.Int,
    'endTime': IDL.Opt(IDL.Int),
    'duration': IDL.Int,  // Changed from Nat to Int to match the Motoko code
    'completed': IDL.Bool,
    'progress': IDL.Nat,
    'xpEarned': IDL.Int,  // Changed from Nat to Int to match the Motoko code
    'date': IDL.Text,
  });
  const Result_1 = IDL.Variant({ ok: LearningSession, err: IDL.Text });
  
  const CourseProgress = IDL.Record({
    'userId': IDL.Principal,
    'courseId': IDL.Text,
    'courseName': IDL.Text,
    'totalLessons': IDL.Nat,
    'completedLessons': IDL.Nat,
    'totalDuration': IDL.Nat,
    'timeSpent': IDL.Nat,
    'lastAccessed': IDL.Int,
    'completionRate': IDL.Nat,
    'xpEarned': IDL.Nat,
    'status': IDL.Text,
  });
  const Result_2 = IDL.Variant({ ok: CourseProgress, err: IDL.Text });
  
  const DailyActivity = IDL.Record({
    'userId': IDL.Principal,
    'date': IDL.Text,
    'sessionsCount': IDL.Int,
    'totalTimeSpent': IDL.Int,
    'xpEarned': IDL.Int,
    'coursesAccessed': IDL.Vec(IDL.Text),
  });
  
  const WeeklyStats = IDL.Record({
    'userId': IDL.Principal,
    'weekDates': IDL.Vec(IDL.Text),
    'dailyHours': IDL.Vec(IDL.Float64),
    'totalHours': IDL.Float64,
    'averageHours': IDL.Float64,
  });
  
  const CourseStats = IDL.Record({
    'userId': IDL.Principal,
    'completed': IDL.Nat,
    'inProgress': IDL.Nat,
    'paused': IDL.Nat,
    'notStarted': IDL.Nat,
    'totalCourses': IDL.Nat,
    'overallCompletionRate': IDL.Nat,
  });

  return IDL.Service({
    'endLearningSession': IDL.Func(
      [IDL.Text, IDL.Bool, IDL.Nat, IDL.Int],  // Changed last param to Int for xpEarned
      [Result_1],
      []
    ),
    'generateSampleData': IDL.Func([], [Result], []),
    'getCourseStats': IDL.Func([], [CourseStats], ['query']),
    'getMyCourseProgress': IDL.Func([], [IDL.Vec(CourseProgress)], ['query']),
    'getMySessions': IDL.Func([], [IDL.Vec(LearningSession)], ['query']),
    'getWeeklyStats': IDL.Func([], [WeeklyStats], ['query']),
    'startLearningSession': IDL.Func(
      [IDL.Text, IDL.Text],
      [Result],
      []
    ),
    'updateCourseProgress': IDL.Func(
      [
        IDL.Text,  // courseId
        IDL.Text,  // courseName
        IDL.Nat,   // totalLessons
        IDL.Nat,   // completedLessons
        IDL.Nat,   // timeSpent
        IDL.Nat,   // xpEarned
        IDL.Text   // status
      ],
      [Result_2],
      []
    ),
  });
};

export const init = () => { return []; };