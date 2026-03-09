// controllers/consultation.controller.js
const consultationService = require('./consultation.service');

// GET all consultation types
exports.getConsultationTypes = async (req, res) => {
    const data = await consultationService.getConsultationTypes();

    res.json({
        success: true,
        count: data.length,
        data
    });
};

// GET single consultation type by ID
exports.getConsultationTypeById = async (req, res) => {
    const { id } = req.params;
    const data = await consultationService.getConsultationTypeById(id);

    if (!data) {
        return res.status(404).json({
            success: false,
            message: 'Consultation type not found'
        });
    }

    res.json({
        success: true,
        data
    });
};

// CREATE new consultation type
exports.createConsultationType = async (req, res) => {
    const typeData = req.body;
    const data = await consultationService.createConsultationType(typeData);

    res.status(201).json({
        success: true,
        message: 'Consultation type created successfully',
        data
    });
};

// UPDATE consultation type
exports.updateConsultationType = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const data = await consultationService.updateConsultationType(id, updateData);

    res.json({
        success: true,
        message: 'Consultation type updated successfully',
        data
    });
};

// DELETE consultation type
exports.deleteConsultationType = async (req, res) => {
    const { id } = req.params;
    const data = await consultationService.deleteConsultationType(id);

    res.json({
        success: true,
        message: data.message
    });
};

// TOGGLE consultation type status
exports.toggleConsultationTypeStatus = async (req, res) => {
    const { id } = req.params;
    const data = await consultationService.toggleConsultationTypeStatus(id);

    res.json({
        success: true,
        message: `Consultation type ${data.isActive ? 'activated' : 'deactivated'}`,
        data
    });
};

// REORDER consultation types
exports.reorderConsultationTypes = async (req, res) => {
    const { orderMap } = req.body;

    if (!orderMap || typeof orderMap !== 'object') {
        return res.status(400).json({
            success: false,
            message: 'Order map is required'
        });
    }

    const data = await consultationService.reorderConsultationTypes(orderMap);

    res.json({
        success: true,
        message: data.message
    });
};