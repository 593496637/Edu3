import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  CourseCreated,
  CoursePurchased,
  OwnershipTransferred
} from "../generated/CoursePlatform/CoursePlatform"

export function createCourseCreatedEvent(
  courseId: BigInt,
  creator: Address,
  priceInYd: BigInt
): CourseCreated {
  let courseCreatedEvent = changetype<CourseCreated>(newMockEvent())

  courseCreatedEvent.parameters = new Array()

  courseCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "courseId",
      ethereum.Value.fromUnsignedBigInt(courseId)
    )
  )
  courseCreatedEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )
  courseCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "priceInYd",
      ethereum.Value.fromUnsignedBigInt(priceInYd)
    )
  )

  return courseCreatedEvent
}

export function createCoursePurchasedEvent(
  courseId: BigInt,
  student: Address,
  creator: Address
): CoursePurchased {
  let coursePurchasedEvent = changetype<CoursePurchased>(newMockEvent())

  coursePurchasedEvent.parameters = new Array()

  coursePurchasedEvent.parameters.push(
    new ethereum.EventParam(
      "courseId",
      ethereum.Value.fromUnsignedBigInt(courseId)
    )
  )
  coursePurchasedEvent.parameters.push(
    new ethereum.EventParam("student", ethereum.Value.fromAddress(student))
  )
  coursePurchasedEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )

  return coursePurchasedEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent =
    changetype<OwnershipTransferred>(newMockEvent())

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}
