const responseHelper = {
    //for all standard errors
    error: function (res, message, httpCode = 200) {
        res.status(httpCode).json({
            statusCode: 422,
            message: message
        });
    },

    errorWithData: function (res, message, data = {}, httpCode = 200) {
        res.status(httpCode).json({
            statusCode: 422,
            message: message,
            data: data
        });
    },

    //for database save error
    databaseError: function (res, error, httpCode = 200) {

        if (error && error.code && error.code == 11000) {
            res.status(httpCode).json({
                statusCode: 500,
                message: 'Fields Value should be Unique.'
            });
        } else {
            res.status(httpCode).json({
                statusCode: 500,
                message: 'Server Error'
            });
        };
    },

    //for standard server error 
    serverError: function (res, error, httpCode = 200) {
        console.error("\n\n\nSERVER_ERROR : ", error);
        console.error("\n\n\n");
        res.status(httpCode).json({
            statusCode: 500,
            message: 'Server Error'
        });
    },

    // for bcrypt hash error 
    bcryptError: function (res, error, httpCode = 200) {

        res.status(httpCode).json({
            statusCode: 500,
            message: 'Bcrypt Error'
        });
    },

    //for succesful request with data
    successWithData: function (res, msg, data, httpCode = 200) {
        res.status(httpCode).json({
            statusCode: 200,
            message: msg,
            data: data
        });
    },

    //for succesful request with data
    successWithPaginationData: function (res, msg, data, pagination, httpCode = 200) {
        res.status(httpCode).json({
            statusCode: 200,
            message: msg,
            data: data,
            pagination
        });
    },

    //for successful request with message
    successWithMessage: function (res, message, httpCode = 200) {
        res.status(httpCode).json({
            statusCode: 200,
            message: message
        });
    },

    errorWithMessage: function (message, code) {
        return ({
            "status": code || 0,
            "message": message || 'Error occured',
            "result": {}
        })
    },

    correct: function (res, data, status = 200) {
        // const returnedTarget = Object.assign(data, { success: true });
        data.success = true;
        if (data.resp_code) {
            data.resp_message = data.resp_code.MSG; //get message 
            data.resp_code = data.resp_code.CODE; //overwrite reponse
        }
        return res.status(status).json(data);
    },

    failed: function (res, data = false, status = 200) {
        res.locals.errResponse = data;
        var resp = {
            success: false,
        };
        if (data) {
            // resp['data'] = data;
            resp = Object.assign(data, resp);
            if (resp.resp_code) {
                data.resp_message = data.resp_code.MSG; //get message 
                data.resp_code = data.resp_code.CODE; //overwrite reponse
                return res.status(status).json(resp);
            } else {
                return res.status(status).json({ success: false });
            }
        }
        return res.status(status).json(resp);
    },


}

global.responseHelper = responseHelper;
module.exports = responseHelper;