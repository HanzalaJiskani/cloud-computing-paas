exports.handler = async function (event) {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({
                error: "Method not allowed."
            })
        };
    }

    try {
        const body = JSON.parse(event.body || "{}");

        const {
            name,
            email,
            phone,
            course
        } = body;

        if (!name || !email || !course) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: "Name, email and course are required."
                })
            };
        }

        const result = await callOdoo(
            "res.partner",
            "create",
            [{
                name: name,
                email: email,
                phone: phone || "",
                comment: `Student Course: ${course}`
            }]
        );

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                success: true,
                id: result
            })
        };

    } catch (error) {
        console.error(error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "Unable to save student to Odoo."
            })
        };
    }
};


async function callOdoo(model, method, args) {

    const url = process.env.ODOO_URL;
    const database = process.env.ODOO_DATABASE;
    const username = process.env.ODOO_USERNAME;
    const apiKey = process.env.ODOO_API_KEY;

    if (!url || !database || !username || !apiKey) {
        throw new Error(
            "Odoo environment variables are missing."
        );
    }

    const uid = await jsonRpc(
        `${url}/jsonrpc`,
        "call",
        {
            service: "common",
            method: "authenticate",
            args: [
                database,
                username,
                apiKey,
                {}
            ]
        }
    );

    if (!uid) {
        throw new Error(
            "Odoo authentication failed."
        );
    }

    return await jsonRpc(
        `${url}/jsonrpc`,
        "call",
        {
            service: "object",
            method: "execute_kw",
            args: [
                database,
                uid,
                apiKey,
                model,
                method,
                args
            ]
        }
    );
}


async function jsonRpc(url, method, params) {

    const response = await fetch(url, {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            jsonrpc: "2.0",
            method: method,
            params: params,
            id: Date.now()
        })
    });

    if (!response.ok) {
        throw new Error(
            `Odoo returned HTTP ${response.status}`
        );
    }

    const data = await response.json();

    if (data.error) {
        throw new Error(
            data.error.message ||
            "Odoo API error"
        );
    }

    return data.result;
}
