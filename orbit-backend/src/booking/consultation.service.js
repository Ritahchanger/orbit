// services/consultation.service.js
const ConsultationType = require('./consultation.model');

class ConsultationService {
    // GET all consultation types
    async getConsultationTypes() {

        const types = await ConsultationType.find({}).sort('order');

        return types.map(type => ({
            id: type.id,
            title: type.title,
            description: type.description,
            duration: type.duration,
            price: type.price.display,
            icon: type.icon,
            features: type.features,
            isActive: type.isActive
        }));
    }

    // GET single consultation type by ID
    async getConsultationTypeById(id) {
        const type = await ConsultationType.findOne({ id });
        if (!type) return null;

        return {
            id: type.id,
            title: type.title,
            description: type.description,
            duration: type.duration,
            price: type.price.display,
            amount: type.price.amount,
            currency: type.price.currency,
            icon: type.icon,
            features: type.features,
            isActive: type.isActive,
            order: type.order
        };
    }

    // CREATE new consultation type
    async createConsultationType(typeData) {
        // Generate ID from title if not provided
        if (!typeData.id) {
            typeData.id = typeData.title
                .toLowerCase()
                .replace(/[^a-z0-9\s]/g, '')
                .replace(/\s+/g, '-');
        }

        // Ensure price object structure
        if (typeof typeData.price === 'string') {
            typeData.price = {
                amount: 0,
                currency: 'KES',
                display: typeData.price
            };
        } else if (typeof typeData.price === 'number') {
            typeData.price = {
                amount: typeData.price,
                currency: 'KES',
                display: `KSh ${typeData.price}`
            };
        }

        // Set default values
        const consultationType = new ConsultationType({
            ...typeData,
            isActive: typeData.isActive !== undefined ? typeData.isActive : true,
            order: typeData.order || 0,
            features: typeData.features || []
        });

        return await consultationType.save();
    }

    // UPDATE consultation type
    async updateConsultationType(id, updateData) {
        // Handle price updates
        if (updateData.price) {
            if (typeof updateData.price === 'string') {
                updateData.price = {
                    amount: 0,
                    currency: 'KES',
                    display: updateData.price
                };
            } else if (typeof updateData.price === 'number') {
                updateData.price = {
                    amount: updateData.price,
                    currency: 'KES',
                    display: `KSh ${updateData.price}`
                };
            }
        }

        // Convert isActive from string to boolean if needed
        if (updateData.isActive !== undefined) {
            if (typeof updateData.isActive === 'string') {
                // Handle "on" from checkbox or other truthy strings
                updateData.isActive = ['true', 'on', '1', 'yes'].includes(
                    updateData.isActive.toLowerCase()
                );
            }
        }

        // Don't allow changing the ID
        if (updateData.id) {
            delete updateData.id;
        }

        const updatedType = await ConsultationType.findOneAndUpdate(
            { id },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedType) {
            throw new Error('Consultation type not found');
        }

        return updatedType;
    }

    // DELETE consultation type (soft delete)
    async deleteConsultationType(id) {
        const deletedType = await ConsultationType.findOneAndDelete({ id });

        if (!deletedType) {
            throw new Error('Consultation type not found');
        }

        return { message: 'Consultation type deleted successfully' };
    }

    // TOGGLE consultation type active status
    async toggleConsultationTypeStatus(id) {
        const type = await ConsultationType.findOne({ id });
        if (!type) {
            throw new Error('Consultation type not found');
        }

        type.isActive = !type.isActive;
        await type.save();

        return {
            id: type.id,
            title: type.title,
            isActive: type.isActive
        };
    }

    // REORDER consultation types
    async reorderConsultationTypes(orderMap) {
        const updates = Object.keys(orderMap).map(async (id) => {
            return ConsultationType.findOneAndUpdate(
                { id },
                { $set: { order: orderMap[id] } },
                { new: true }
            );
        });

        await Promise.all(updates);
        return { message: 'Consultation types reordered successfully' };
    }
}

module.exports = new ConsultationService();