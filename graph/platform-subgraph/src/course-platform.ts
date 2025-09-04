import {
  CourseCreated as CourseCreatedEvent,
  CoursePurchased as CoursePurchasedEvent,
  CourseDeleted as CourseDeletedEvent,
  PlatformFeeCollected as PlatformFeeCollectedEvent,
  PlatformFeeRateUpdated as PlatformFeeRateUpdatedEvent,
  PlatformTreasuryUpdated as PlatformTreasuryUpdatedEvent,
} from "../generated/CoursePlatform/CoursePlatform";
import { Course, User, PlatformFee, PlatformStats } from "../generated/schema";
import { BigInt, Address } from "@graphprotocol/graph-ts";

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
  course.purchaseCount = BigInt.fromI32(0); // 初始化购买计数为0

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

  // 增加课程购买计数
  course.purchaseCount = course.purchaseCount.plus(BigInt.fromI32(1));
  
  student.save();
  course.save();
}

export function handleCourseDeleted(event: CourseDeletedEvent): void {
  // 加载要删除的课程实体
  let course = Course.load(event.params.courseId.toString());
  if (!course) {
    return; // 课程不存在，直接返回
  }

  // 从存储中移除课程实体
  // 注意：由于使用了@derivedFrom，相关的用户关系会自动更新
  let courseId = course.id;
  
  // 移除课程实体 - 使用store.remove
  // course.set("id", null); // 不支持null值
  // course.save();
  
  // 或者使用store.remove
  // store.remove("Course", courseId);
}

export function handlePlatformFeeCollected(event: PlatformFeeCollectedEvent): void {
  // 创建平台手续费记录
  let feeId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let platformFee = new PlatformFee(feeId);
  
  platformFee.courseId = event.params.courseId;
  platformFee.course = event.params.courseId.toString();
  platformFee.payer = event.params.from.toHexString();
  platformFee.feeAmount = event.params.feeAmount;
  platformFee.timestamp = event.block.timestamp;
  
  platformFee.save();

  // 更新平台统计
  let stats = PlatformStats.load("platform");
  if (!stats) {
    stats = new PlatformStats("platform");
    stats.totalFees = BigInt.fromI32(0);
    stats.feeRate = BigInt.fromI32(500); // 默认5%
    if (event.transaction.to) {
      stats.treasury = event.transaction.to!;
    } else {
      stats.treasury = Address.zero();
    }
  }
  
  stats.totalFees = stats.totalFees.plus(event.params.feeAmount);
  stats.save();

  // 确保付费者用户存在
  let payer = User.load(event.params.from.toHexString());
  if (!payer) {
    payer = new User(event.params.from.toHexString());
    payer.coursesOwned = [];
    payer.save();
  }
}

export function handlePlatformFeeRateUpdated(event: PlatformFeeRateUpdatedEvent): void {
  let stats = PlatformStats.load("platform");
  if (!stats) {
    stats = new PlatformStats("platform");
    stats.totalFees = BigInt.fromI32(0);
    if (event.transaction.to) {
      stats.treasury = event.transaction.to!;
    } else {
      stats.treasury = Address.zero();
    }
  }
  
  stats.feeRate = event.params.newRate;
  stats.save();
}

export function handlePlatformTreasuryUpdated(event: PlatformTreasuryUpdatedEvent): void {
  let stats = PlatformStats.load("platform");
  if (!stats) {
    stats = new PlatformStats("platform");
    stats.totalFees = BigInt.fromI32(0);
    stats.feeRate = BigInt.fromI32(500); // 默认5%
  }
  
  stats.treasury = event.params.newTreasury;
  stats.save();
}
