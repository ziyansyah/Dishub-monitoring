"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const activity_service_1 = require("./activity.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
let ActivityController = class ActivityController {
    constructor(activityService) {
        this.activityService = activityService;
    }
    getLogs(query) {
        return this.activityService.getLogs(query);
    }
    getRecentLogs(limit) {
        return this.activityService.getRecentLogs(limit ? parseInt(limit) : 20);
    }
    getStats() {
        return this.activityService.getActivityStats();
    }
    getActionsList() {
        return this.activityService.getActionsList();
    }
    getActivitiesByUser(userId, limit) {
        return this.activityService.getActivityByUser(userId, limit ? parseInt(limit) : 50);
    }
    getFailedActivities() {
        return this.activityService.getFailedActivities();
    }
    getSystemActivities() {
        return this.activityService.getSystemActivities();
    }
    async exportToCSV(query, res, userAgent) {
        try {
            const csvData = await this.activityService.exportToCSV(query);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="activity-logs-${new Date().toISOString().split('T')[0]}.csv"`);
            res.send(csvData);
            await this.activityService.logActivity('Export Activity Logs', 'system', 'N/A', userAgent || 'Unknown', 'success', 'Exported activity logs to CSV');
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to export activity logs',
                error: error.message,
            });
        }
    }
};
exports.ActivityController = ActivityController;
__decorate([
    (0, common_1.Get)('logs'),
    (0, permissions_guard_1.Permissions)('view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get activity logs with filtering' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Activity logs retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ActivityController.prototype, "getLogs", null);
__decorate([
    (0, common_1.Get)('recent'),
    (0, permissions_guard_1.Permissions)('view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get recent activity logs' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Recent activity logs retrieved successfully' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ActivityController.prototype, "getRecentLogs", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, permissions_guard_1.Permissions)('view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get activity statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Activity statistics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ActivityController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('actions'),
    (0, permissions_guard_1.Permissions)('view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get list of all activity types' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Activity types retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ActivityController.prototype, "getActionsList", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, permissions_guard_1.Permissions)('view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get activities by user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User activities retrieved successfully' }),
    __param(0, Param('userId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], ActivityController.prototype, "getActivitiesByUser", null);
__decorate([
    (0, common_1.Get)('failed'),
    (0, permissions_guard_1.Permissions)('view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get failed activities (last 24 hours)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Failed activities retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ActivityController.prototype, "getFailedActivities", null);
__decorate([
    (0, common_1.Get)('system'),
    (0, permissions_guard_1.Permissions)('view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get system activities (last 7 days)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'System activities retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ActivityController.prototype, "getSystemActivities", null);
__decorate([
    (0, common_1.Post)('export'),
    (0, permissions_guard_1.Permissions)('export'),
    (0, swagger_1.ApiOperation)({ summary: 'Export activity logs to CSV' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Activity logs exported successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Headers)('user-agent')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "exportToCSV", null);
exports.ActivityController = ActivityController = __decorate([
    (0, swagger_1.ApiTags)('Activity'),
    (0, common_1.Controller)('activity'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [activity_service_1.ActivityService])
], ActivityController);
//# sourceMappingURL=activity.controller.js.map