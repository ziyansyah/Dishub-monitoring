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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const reports_service_1 = require("./reports.service");
const generate_report_dto_1 = require("./dto/generate-report.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
let ReportsController = class ReportsController {
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    async generate(generateReportDto, req) {
        return this.reportsService.generateReport(generateReportDto, req.user.id);
    }
    async findAll(req) {
        return this.reportsService.findAll(req.user.id);
    }
    async findOne(id, req) {
        return this.reportsService.findOne(id, req.user.id);
    }
    async download(id, req, res) {
        try {
            const filePath = await this.reportsService.downloadReport(id, req.user.id);
            const fs = require('fs');
            const path = require('path');
            const report = await this.reportsService.findOne(id, req.user.id);
            res.setHeader('Content-Type', this.getContentType(report.fileFormat));
            res.setHeader('Content-Disposition', `attachment; filename="${report.title}.${report.fileFormat}"`);
            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
        }
        catch (error) {
            res.status(error.status || 500).json({
                success: false,
                message: error.message,
            });
        }
    }
    async remove(id, req) {
        return this.reportsService.deleteReport(id, req.user.id);
    }
    getStats() {
        return this.reportsService.getReportStats();
    }
    getContentType(format) {
        switch (format) {
            case 'pdf':
                return 'application/pdf';
            case 'excel':
                return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            case 'csv':
                return 'text/csv';
            default:
                return 'application/octet-stream';
        }
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Post)('generate'),
    (0, permissions_guard_1.Permissions)('export'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Generate a new report' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Report generation started' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid report parameters' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_report_dto_1.GenerateReportDto, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "generate", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_guard_1.Permissions)('view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all reports for current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reports retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_guard_1.Permissions)('view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get report by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Report retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Report not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/download'),
    (0, permissions_guard_1.Permissions)('export'),
    (0, swagger_1.ApiOperation)({ summary: 'Download generated report' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Report downloaded successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Report not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Report not ready for download' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "download", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_guard_1.Permissions)('delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete report' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Report deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Report not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('stats/summary'),
    (0, permissions_guard_1.Permissions)('view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get report statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Report statistics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getStats", null);
exports.ReportsController = ReportsController = __decorate([
    (0, swagger_1.ApiTags)('Reports'),
    (0, common_1.Controller)('reports'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map