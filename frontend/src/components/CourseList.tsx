import { useState, useEffect } from "react";
import graphClient, { GET_ALL_COURSES } from "../graphClient";
import apiClient from "../apiClient";
import { CourseCard } from "./CourseCard";

interface CourseFromGraph {
  id: string;
  creator: { id: string };
  priceInYd: string;
  purchaseCount: string;
}

interface CourseDetailsFromAPI {
  uuid: string;
  title: string;
  description: string;
  creator_address: string;
  chain_id: string;
  created_at: string;
}

// 完整课程类型，用于直接从后端API获取
type FullCourse = {
  id: string;
  uuid: string;
  title: string;
  description: string;
  creator: { id: string };
  priceInYd: string;
  purchaseCount: string;
  chain_id: string;
};

export function CourseList() {
  const [courses, setCourses] = useState<FullCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 新的优化策略：同时获取链上和链下数据，然后合并
        const [onChainDataResponse, offChainDataResponse] = await Promise.allSettled([
          graphClient.request<{ courses: CourseFromGraph[] }>(GET_ALL_COURSES),
          apiClient.get<CourseDetailsFromAPI[]>('/courses')
        ]);

        // 处理链上数据
        let onChainData: CourseFromGraph[] = [];
        if (onChainDataResponse.status === "fulfilled") {
          onChainData = onChainDataResponse.value.courses || [];
        }

        // 处理链下数据 
        let offChainData: CourseDetailsFromAPI[] = [];
        if (offChainDataResponse.status === "fulfilled") {
          offChainData = offChainDataResponse.value.data || [];
        }

        // 如果没有数据，直接返回
        if (onChainData.length === 0 && offChainData.length === 0) {
          setCourses([]);
          setIsLoading(false);
          return;
        }

        // 优先使用链下数据（包含完整信息），补充链上数据（价格和购买数）
        const offChainMap = new Map<string, CourseDetailsFromAPI>();
        offChainData.forEach(course => {
          offChainMap.set(course.chain_id, course);
        });

        const onChainMap = new Map<string, CourseFromGraph>();
        onChainData.forEach(course => {
          onChainMap.set(course.id, course);
        });

        // 以链下数据为主，合并链上数据
        const fullCourses: FullCourse[] = offChainData.map(offChainCourse => {
          const onChainCourse = onChainMap.get(offChainCourse.chain_id);
          return {
            id: offChainCourse.chain_id || offChainCourse.uuid, // Use UUID as fallback if chain_id is null
            uuid: offChainCourse.uuid,
            title: offChainCourse.title,
            description: offChainCourse.description,
            creator: { id: offChainCourse.creator_address },
            priceInYd: onChainCourse?.priceInYd || "0",
            purchaseCount: onChainCourse?.purchaseCount || "0",
            chain_id: offChainCourse.chain_id
          };
        });

        setCourses(fullCourses);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
        setError("Could not load courses. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [refreshTrigger]);

  const handleCourseDeleted = () => {
    // 触发重新获取课程列表
    setRefreshTrigger(prev => prev + 1);
  };

  if (isLoading) {
    return <p>Loading courses...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} onCourseDeleted={handleCourseDeleted} />
      ))}
    </div>
  );
}
