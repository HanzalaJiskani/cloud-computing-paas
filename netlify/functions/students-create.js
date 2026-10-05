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

        const body = JSON.parse(
            event.body || "{}"
        );

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
                    error:
                        "Name, email and course are required."
                })
            };
        }


        const url =
            process.env.ODOO_URL;

        const database =
            process.env.ODOO_DATABASE;

        const apiKey =
            process.env.ODOO_API_KEY;


        if (!url || !database || !apiKey) {

            throw new Error(
                "Odoo environment variables are missing."
            );
        }


        const response = await fetch(
            `${url}/json/2/res.partner/create`,
            {
                method: "POST",

                headers: {
                    "Authorization":
                        `bearer ${apiKey}`,

                    "X-Odoo-Database":
                        database,

                    "Content-Type":
                        "application/json",

                    "User-Agent":
                        "Student-Showcase/1.0"
                },

                body: JSON.stringify({

                    name: name,

                    email: email,

                    phone: phone || "",

                    comment:
                        `Student Course: ${course}`

                })
            }
        );


        const responseText =
            await response.text();


        if (!response.ok) {

            console.error(
                "Odoo error:",
                responseText
            );

            return {

                statusCode:
                    response.status,

                body: JSON.stringify({

                    error:
                        "Odoo rejected the request.",

                    details:
                        responseText

                })

            };
        }


        let result;

        try {

            result =
                JSON.parse(responseText);

        } catch {

            result =
                responseText;

        }


        return {

            statusCode: 201,

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({

                success: true,

                result: result

            })

        };


    } catch (error) {

        console.error(error);

        return {

            statusCode: 500,

            body: JSON.stringify({

                error:
                    "Unable to save student to Odoo."

            })

        };

    }

};
