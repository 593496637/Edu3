import {
  CourseCreated as CourseCreatedEvent,
  CoursePurchased as CoursePurchasedEvent,
  OwnershipTransferred as OwnershipTransferredEvent
} from "../generated/CoursePlatform/CoursePlatform"
import {
  CourseCreated,
  CoursePurchased,
  OwnershipTransferred
} from "../generated/schema"

export function handleCourseCreated(event: CourseCreatedEvent): void {
  let entity = new CourseCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.courseId = event.params.courseId
  entity.creator = event.params.creator
  entity.priceInYd = event.params.priceInYd

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleCoursePurchased(event: CoursePurchasedEvent): void {
  let entity = new CoursePurchased(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.courseId = event.params.courseId
  entity.student = event.params.student
  entity.creator = event.params.creator

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
