import * as uuid from 'uuid'

import { Group } from '../models/Group'
import { GroupAccess } from '../dataLayer/groupsAccess'
import { CreateGroupRequest } from '../requests/createGroupRequest'

const groupAccess = new GroupAccess()

export async function getAllGroups(): Promise<Group[]> {
  return groupAccess.getAllGroups()
}

export async function createGroup(
  createGroupRequest: CreateGroupRequest
): Promise<Group> {

  const itemId = uuid.v4()

  return await groupAccess.createGroup({
    id: itemId,
    name: createGroupRequest.name,
    description: createGroupRequest.description
  })
}