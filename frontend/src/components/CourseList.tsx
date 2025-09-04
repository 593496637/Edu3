import { useState, useEffect } from "react";
import graphClient, { GET_ALL_COURSES } from "../graphClient";
import apiClient from "../apiClient";
import { CourseCard } from "./CourseCard";

interface CourseFromGraph {
  id: string;
  creator: { id: string };
  priceInYd: string;
}

interface CourseDetailsFromAPI {
  uuid: string;
  title: string;
  description: string;
  chain_id: string; // 后端返回的数据里有这个
}

// 合并后的完整课程类型
type FullCourse = CourseFromGraph & {
  title: string;
  description: string;
  uuid?: string;
  chain_id?: string;
};

export function CourseList() {
  const [courses, setCourses] = useState<FullCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 1. 从 The Graph 获取链上数据
        const onChainData = await graphClient.request<{
          courses: CourseFromGraph[];
        }>(GET_ALL_COURSES);
        if (!onChainData.courses || onChainData.courses.length === 0) {
          setIsLoading(false);
          return;
        }

        // 2. 并行地为每个课程获取链下详情，使用 Promise.allSettled
        const courseDetailsPromises = onChainData.courses.map((course) =>
          apiClient.get<CourseDetailsFromAPI>(`/courses/${course.id}`)
        );

        // 使用 allSettled，即使部分请求失败(404)，也不会中断整个流程
        const courseDetailsResults = await Promise.allSettled(
          courseDetailsPromises
        );

        // 过滤出成功的请求，并构建一个以 chain_id 为键的 Map
        const offChainDataMap = new Map<string, CourseDetailsFromAPI>();
        courseDetailsResults.forEach((result) => {
          if (result.status === "fulfilled") {
            const courseDetail = result.value.data;
            // 使用 chain_id 作为 Map 的键
            offChainDataMap.set(courseDetail.chain_id, courseDetail);
          }
        });

        // 3. 合并数据
        const fullCourses = onChainData.courses.map((courseFromGraph) => {
          const offChainDetails = offChainDataMap.get(courseFromGraph.id);
          return {
            ...courseFromGraph,
            title: offChainDetails?.title || "Title not found",
            description:
              offChainDetails?.description || "Description not found",
          };
        });

        setCourses(fullCourses as FullCourse[]);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
        setError(
          "Could not load courses. The Graph subgraph might be out of sync."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (isLoading) {
    return <p>Loading courses...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
