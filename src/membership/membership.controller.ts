import {
  Controller,
  Delete,
  Get,
  NotImplementedException,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MembershipService } from './membership.service';
import { ApiTags } from '@nestjs/swagger';
import { MemberShipGuard } from 'src/orgs/guards/member.guard';
import { RolesGuard } from 'src/orgs/guards/roles.guard';

@UseGuards(MemberShipGuard, RolesGuard)
@ApiTags('Membership')
@Controller({
  path: 'orgs/:slug',
})
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  @Post('invites')
  inviterUser() {
    throw new NotImplementedException();
  }

  @Patch('invites/:inviteId')
  updateInvite() {
    throw new NotImplementedException();
  }

  @Delete('invites/:inviteId')
  cancelInvite() {
    throw new NotImplementedException();
  }

  @Get('invites/:inviteId')
  getInvited() {
    throw new NotImplementedException();
  }

  @Get('invites')
  getInvites() {
    throw new NotImplementedException();
  }

  @Patch('mems/:userId')
  updateRole() {
    throw new NotImplementedException();
  }

  @Delete('mems/me')
  leftOrg() {
    throw new NotImplementedException();
  }

  @Delete('mems/:userId')
  removeMember() {
    throw new NotImplementedException();
  }
}
