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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatisticsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const statistics_service_1 = require("./statistics.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
let StatisticsController = class StatisticsController {
    constructor(statisticsService) {
        this.statisticsService = statisticsService;
    }
    getDashboardStats() {
        return this.statisticsService.getDashboardStats();
    }
    getVehicleTypeDistribution() {
        return this.statisticsService.getVehicleTypeDistribution();
    }
    getTaxComplianceStats() {
        return this.statisticsService.getTaxComplianceStats();
    }
    getWeeklyTrends() {
        return this.statisticsService.getWeeklyTrends();
    }
    getScanActivityHeatmap() {
        return this.statisticsService.getScanActivityHeatmap();
    }
    getLocationStats() {
        return this.statisticsService.getLocationStats();
    }
    getUserActivityStats() {
        return this.statisticsService.getUserActivityStats();
    }
    getExportStats() {
        return this.statisticsService.getExportStats();
    }
};
exports.StatisticsController = StatisticsController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, permissions_guard_1.Permissions)('view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get dashboard statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dashboard statistics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StatisticsController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Get)('vehicle-types'),
    (0, permissions_guard_1.Permissions)('view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get vehicle type distribution' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vehicle type distribution retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StatisticsController.prototype, "getVehicleTypeDistribution", null);
__decorate([
    (0, common_1.Get)('tax-compliance'),
    (0, permissions_guard_1.Permissions)('view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get tax compliance statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tax compliance statistics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StatisticsController.prototype, "getTaxComplianceStats", null);
__decorate([
    (0, common_1.Get)('weekly-trends'),
    (0, permissions_guard_1.Permissions)('view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get weekly scanning trends' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Weekly trends retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StatisticsController.prototype, "getWeeklyTrends", null);
__decorate([
    (0, common_1.Get)('activity-heatmap'),
    (0, permissions_guard_1.Permissions)('view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get scan activity heatmap data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Activity heatmap retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StatisticsController.prototype, "getScanActivityHeatmap", null);
__decorate([
    (0, common_1.Get)('locations'),
    (0, permissions_guard_1.Permissions)('view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get location-based statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Location statistics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StatisticsController.prototype, "getLocationStats", null);
__decorate([
    (0, common_1.Get)('user-activity'),
    (0, permissions_guard_1.Permissions)('view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user activity statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User activity statistics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StatisticsController.prototype, "getUserActivityStats", null);
__decorate([
    (0, common_1.Get)('exports'),
    (0, permissions_guard_1.Permissions)('view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get export statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Export statistics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StatisticsController.prototype, "getExportStats", null);
exports.StatisticsController = StatisticsController = __decorate([
    (0, swagger_1.ApiTags)('Statistics'),
    (0, common_1.Controller)('statistics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [statistics_service_1.StatisticsService])
], StatisticsController);
//# sourceMappingURL=statistics.controller.js.map