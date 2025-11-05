async function validateCompanyId(req, res, next) {
    try {
      const companyId = req.body.companyId || req.params.companyId || req.headers['x-company-id'];
      
      if (!companyId) {
        return res.status(401).json({ 
          success: false, 
          error: 'Missing company ID',
          code: 'MISSING_COMPANY_ID'
        });
      }
       const token = req.body.token || req.params.token || req.headers['x-token'];
      
      if (!token) {
        return res.status(401).json({ 
          success: false, 
          error: 'Missingtoken',
          code: 'MISSING_TOKEN'
        });
      }
  
      
      // בדיקת חברה בטבלת Compaing או Companies
      const query = "SELECT * FROM AppC_Companys WHERE IdCompany = @companyId ";
      const params = [
        { name: 'companyId', type: 'Int', value: parseInt(companyId) }
      ];
      
      const result = await dbConnection.executeQuery(query, params);
      console.log("middleware result:",{result}) ;
         if (!result || result.length === 0) {
        logger.warn(`Invalid company ID attempted: ${companyId}`, {
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });
        
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid or inactive company ID',
          code: 'INVALID_COMPANY_ID'
        });
      }
      
      // שמירת פרטי החברה בבקשה
      req.company = result[0];
      req.companyId = parseInt(companyId);
      
      // רישום גישה
      logger.debug(`Company validated successfully`, {
        companyId: companyId,
        companyName: result[0].Title || result[0].Name,
        ip: req.ip,
        endpoint: req.path
      });
      
      next();
      
    } catch (error) {
      logger.error(`Error validating company ID: ${error.message}`, { 
        error,
        ip: req.ip 
      });
      
      res.status(500).json({ 
        success: false, 
        error: 'Company validation failed',
        code: 'VALIDATION_ERROR'
      });
    }
  }