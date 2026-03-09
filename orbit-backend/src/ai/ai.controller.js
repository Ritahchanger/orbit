const aiService = require('./ai.service');

class AIController {
    async analyze(req, res) {
        
            const { data, context, type, format, audience } = req.body;
            
            if (!data) {
                return res.status(400).json({
                    success: false,
                    error: "Data is required"
                });
            }

            const result = await aiService.analyzeData(data, {
                context: context || "general",
                type: type || "analysis",
                format: format || "json",
                audience: audience || "manager"
            });

            res.json({
                success: true,
                timestamp: new Date().toISOString(),
                ...result
            });
       
    }

    async analyzeDashboard(req, res) {
      
            const { data } = req.body;
            
            if (!data) {
                return res.status(400).json({
                    success: false,
                    error: "Dashboard data is required"
                });
            }

            const result = await aiService.analyzeDashboard(data);
            res.json({
                success: true,
                timestamp: new Date().toISOString(),
                data: result
            });
       
    }

    async analyzeProducts(req, res) {
       
            const { data } = req.body;
            
            if (!data) {
                return res.status(400).json({
                    success: false,
                    error: "Products data is required"
                });
            }

            const result = await aiService.analyzeProducts(data);
            res.json({
                success: true,
                timestamp: new Date().toISOString(),
                data: result
            });
       
    }

    async analyzeTransactions(req, res) {
       
            const { data } = req.body;
            
            if (!data) {
                return res.status(400).json({
                    success: false,
                    error: "Transactions data is required"
                });
            }

            const result = await aiService.analyzeTransactions(data);
            res.json({
                success: true,
                timestamp: new Date().toISOString(),
                data: result
            });
        
    }

    async generateReport(req, res) {
      
            const { data, reportType } = req.body;
            
            if (!data) {
                return res.status(400).json({
                    success: false,
                    error: "Data is required for report generation"
                });
            }

            const result = await aiService.generateReport(data, reportType);
            res.json({
                success: true,
                timestamp: new Date().toISOString(),
                report: result
            });
       
    }

    async chat(req, res) {
       
            const { message, history = [] } = req.body;
            
            if (!message || typeof message !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: "Valid message is required"
                });
            }

            const result = await aiService.chat(message, history);
            res.json({
                success: result.success,
                timestamp: new Date().toISOString(),
                ...result
            });
    
    }

    async health(req, res) {
     
            const health = await aiService.healthCheck();
            res.json({
                success: true,
                timestamp: new Date().toISOString(),
                ...health
            });

    }
}

module.exports = new AIController();