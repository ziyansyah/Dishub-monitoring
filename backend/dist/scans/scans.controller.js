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
exports.ScansController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const scans_service_1 = require("./scans.service");
const create_scan_dto_1 = require("./dto/create-scan.dto");
const query_scans_dto_1 = require("./dto/query-scans.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
let ScansController = class ScansController {
    constructor(scansService) {
        this.scansService = scansService;
    }
    async create(createScanDto, req, ip, userAgent) {
        return this.scansService.create(createScanDto, req.user.id, ip, userAgent || 'Unknown');
    }
    findAll(query) {
        return this.scansService.findAll(query);
    }
    findRecent(limit) {
        return this.scansService.findRecent(limit ? parseInt(limit) : 10);
    }
    getHistory(query) {
        return this.scansService.getHistory(query);
    }
    getStats() {
        return this.scansService.getScanStats();
    }
    getLocations() {
        return this.scansService.getScanLocations();
    }
    getTopScannedVehicles(limit) {
        return this.scansService.getTopScannedVehicles(limit ? parseInt(limit) : 10);
    }
    findOne(id) {
        return this.scansService.findOne(id);
    }
    async remove(id, req) {
        return this.scansService.deleteScan(id, req.user.id);
    }
};
exports.ScansController = ScansController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_guard_1.Permissions)('edit'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new vehicle scan' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Scan created successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Ip)()),
    __param(3, (0, common_1.Headers)('user-agent')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_scan_dto_1.CreateScanDto, Object, String, String]),
    __metadata("design:returntype", Promise)
], ScansController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_guard_1.Permissions)('view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all scans with pagination and filtering' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Scans retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_scans_dto_1.QueryScansDto]),
    __metadata("design:returntype", void 0)
], ScansController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('recent'),
    (0, permissions_guard_1.Permissions)('view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get recent scans for dashboard' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Recent scans retrieved successfully' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ScansController.prototype, "findRecent", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, permissions_guard_1.Permissions)('view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get scan history with date filtering' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Scan history retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_scans_dto_1.QueryScansDto]),
    __metadata("design:returntype", void 0)
], ScansController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, permissions_guard_1.Permissions)('view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get scan statistics and analytics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Scan statistics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ScansController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('locations'),
    (0, permissions_guard_1.Permissions)('view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get scan location statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Location statistics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ScansController.prototype, "getLocations", null);
__decorate([
    (0, common_1.Get)('top-vehicles'),
    (0, permissions_guard_1.Permissions)('view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get most frequently scanned vehicles' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Top scanned vehicles retrieved successfully' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ScansController.prototype, "getTopScannedVehicles", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_guard_1.Permissions)('view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get scan by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Scan retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Scan not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ScansController.prototype, "findOne", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_guard_1.Permissions)('delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete scan record' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Scan deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Scan not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ScansController.prototype, "remove", null);
exports.ScansController = ScansController = __decorate([
    (0, swagger_1.ApiTags)('Scans'),
    (0, common_1.Controller)('scans'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [scans_service_1.ScansService])
], ScansController);
//# sourceMappingURL=scans.controller.js.map