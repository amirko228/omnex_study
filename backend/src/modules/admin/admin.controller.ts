import { Controller, Get, Patch, Delete, Param, Query, UseGuards, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class AdminController {
    constructor(private adminService: AdminService) { }

    // GET /admin/users
    @Get('users')
    @ApiOperation({ summary: 'Все пользователи (Admin)' })
    async getUsers(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('search') search?: string,
        @Query('role') role?: string,
    ) {
        return this.adminService.getUsers({ page, limit, search, role });
    }

    // PATCH /admin/users/:id/ban
    @Patch('users/:id/ban')
    @ApiOperation({ summary: 'Заблокировать/Разблокировать пользователя' })
    async toggleBan(@Param('id') id: string) {
        return this.adminService.toggleUserBan(id);
    }

    // PATCH /admin/users/:id/role
    @Patch('users/:id/role')
    @ApiOperation({ summary: 'Изменить роль пользователя' })
    async changeRole(
        @Param('id') id: string,
        @Body() body: { role: string },
    ) {
        return this.adminService.changeUserRole(id, body.role);
    }

    // GET /admin/courses
    @Get('courses')
    @ApiOperation({ summary: 'Все курсы (Admin)' })
    async getCourses(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('search') search?: string,
    ) {
        return this.adminService.getCourses({ page, limit, search });
    }

    // DELETE /admin/courses/:id
    @Delete('courses/:id')
    @ApiOperation({ summary: 'Удалить курс' })
    async deleteCourse(@Param('id') id: string) {
        return this.adminService.deleteCourse(id);
    }

    // PATCH /admin/courses/:id/publish
    @Patch('courses/:id/publish')
    @ApiOperation({ summary: 'Опубликовать/Снять курс' })
    async togglePublish(@Param('id') id: string) {
        return this.adminService.toggleCoursePublish(id);
    }

    // GET /admin/audit-logs
    @Get('audit-logs')
    @ApiOperation({ summary: 'Аудит-логи' })
    async getAuditLogs(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.adminService.getAuditLogs(page, limit);
    }
}
