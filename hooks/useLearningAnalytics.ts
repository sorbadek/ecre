// hooks/useLearningAnalytics.ts
import { useState, useEffect, useCallback } from "react";
import { learningAnalyticsClient } from "@/lib/learning-analytics-client";
import { CourseProgress, WeeklyStats, CourseStats } from "@/lib/learning-analytics-client";

export const useLearningAnalytics = () => {
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [courseStats, setCourseStats] = useState<CourseStats | null>(null);
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [stats, progress] = await Promise.all([
        learningAnalyticsClient.getWeeklyStats(),
        learningAnalyticsClient.getMyCourseProgress()
      ]);

      // Process weekly stats
      if (stats) {
        setWeeklyStats({
          ...stats,
          userId: stats.userId.toString(), // Convert Principal to string
          dailyHours: stats.dailyHours.map(hour => 
            typeof hour === 'bigint' ? Number(hour) : hour
          ),
          totalHours: typeof stats.totalHours === 'bigint' 
            ? Number(stats.totalHours) 
            : stats.totalHours,
          averageHours: typeof stats.averageHours === 'bigint'
            ? Number(stats.averageHours)
            : stats.averageHours
        });
      }

      // Process course progress
      if (Array.isArray(progress)) {
        setCourseProgress(progress.map(p => ({
          ...p,
          userId: p.userId.toString(),
          xpEarned: typeof p.xpEarned === 'bigint' ? Number(p.xpEarned) : p.xpEarned,
          timeSpent: typeof p.timeSpent === 'bigint' ? Number(p.timeSpent) : p.timeSpent,
          totalDuration: typeof p.totalDuration === 'bigint' ? Number(p.totalDuration) : p.totalDuration,
          // Keep lastAccessed as bigint to match the CourseProgress interface
          lastAccessed: p.lastAccessed
        })));
      }

      // Get course stats
      const statsResponse = await learningAnalyticsClient.getCourseStats();
      if (statsResponse) {
        setCourseStats({
          ...statsResponse,
          userId: statsResponse.userId.toString()
        });
      }

    } catch (err) {
      console.error("Error fetching learning analytics:", err);
      setError("Failed to load learning analytics data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    weeklyStats,
    courseStats,
    courseProgress,
    loading,
    error,
    refresh: fetchData
  };
};