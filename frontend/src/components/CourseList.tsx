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
}

// 合并后的完整课程类型
type FullCourse = CourseFromGraph & CourseDetailsFromAPI;

export function CourseList() {
  const [courses, setCourses] = useState<FullCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // 1. 从 The Graph 获取链上数据
        const onChainData = await graphClient.request<{
          courses: CourseFromGraph[];
        }>(GET_ALL_COURSES);

        // 2. 并行地为每个课程获取链下详情
        const courseDetailsPromises = onChainData.courses.map((course) =>
          // 注意：The Graph返回的ID是十进制字符串，而后端的UUID是标准格式
          // 我们的后端目前是拿UUID的前缀转成数字的，这里需要一种方式转换回来
          // 为简化MVP，我们假设后端的 /courses/:uuid 接口也能接受数字ID查询
          apiClient.get<CourseDetailsFromAPI>(`/courses/${course.id}`)
        );
        const courseDetailsResponses = await Promise.all(courseDetailsPromises);
        const offChainDataMap = new Map(
          courseDetailsResponses.map((res) => [res.data.uuid, res.data])
        );

        // 3. 合并数据
        const fullCourses = onChainData.courses.map((course) => ({
          ...course,
          ...offChainDataMap.get(course.id), // 再次假设ID可以匹配
        }));

        setCourses(fullCourses as FullCourse[]);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (isLoading) {
    return <p>Loading courses...</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
