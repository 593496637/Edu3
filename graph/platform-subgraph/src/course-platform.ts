import {
  CourseCreated as CourseCreatedEvent,
  CoursePurchased as CoursePurchasedEvent,
} from "../generated/CoursePlatform/CoursePlatform";
import { Course, User } from "../generated/schema";

export function handleCourseCreated(event: CourseCreatedEvent): void {
  // 确保创建者用户实体存在
  let creator = User.load(event.params.creator.toHexString());
  if (!creator) {
    creator = new User(event.params.creator.toHexString());
    creator.coursesOwned = []; // 初始化数组
    creator.save();
  }

  // 创建一个新的课程实体
  let course = new Course(event.params.courseId.toString());
  course.creator = creator.id;
  course.priceInYd = event.params.priceInYd;
  course.createdAtTimestamp = event.block.timestamp;

  course.save();
}

export function handleCoursePurchased(event: CoursePurchasedEvent): void {
  // 确保学生用户实体存在
  let student = User.load(event.params.student.toHexString());
  if (!student) {
    student = new User(event.params.student.toHexString());
    student.coursesOwned = []; // 初始化数组
    student.save();
  }

  // 加载被购买的课程实体
  let course = Course.load(event.params.courseId.toString());
  // 如果课程不存在，则提前返回 (理论上不应发生)
  if (!course) {
    return;
  }

  // 更新学生拥有的课程列表
  let coursesOwned = student.coursesOwned;
  coursesOwned.push(course.id);
  student.coursesOwned = coursesOwned;

  student.save();
}
