import axios from "axios";

// 创建一个axios实例，并设置后端的URL
const apiClient = axios.create({
  baseURL: "http://localhost:4000", // 你的Web2后端地址
});

interface CourseMetadata {
  title: string;
  description: string;
  creator_address: string;
  content_url?: string;
}

// 定义一个函数用于创建课程元数据
export const createCourseAPI = async (courseData: CourseMetadata) => {
  try {
    const response = await apiClient.post("/courses", courseData);
    return response.data; // 后端会返回 { uuid, courseIdForChain }
  } catch (error) {
    console.error("Error creating course metadata:", error);
    throw error;
  }
};

export default apiClient;
