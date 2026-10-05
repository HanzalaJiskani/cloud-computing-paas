exports.handler = async function (event) {

    if (event.httpMethod !== "GET") {

        return {
            statusCode: 405,

            body: JSON.stringify({
                error: "Method not allowed."
            })
        };

    }


    try {

        const students =
            await callOdoo(
                "res.partner",
                "search_read",
                [
                    [
                        [
                            "comment",
                            "ilike",
                            "Student Course:"
                        ]
                    ],

                    [
                        "name",
                        "email",
                        "phone",
                        "comment"
                    ]
                ]
            );


        const formatted =
            students.map(student => {

                const comment =
                    student.comment || "";


                let course = "";


                if (
                    comment.startsWith(
                        "Student Course:"
                    )
                ) {

                    course =
                        comment.replace(
                            "Student Course:",
                            ""
                        ).trim();

                }


                return {

                    id: student.id,

                    name: student.name,

                    email: student.email || "",

                    phone: student.phone || "",

                    course: course

                };

            });


        return {

            statusCode: 200,

            headers: {

                "Content-Type":
                    "application/json",

                "Cache-Control":
                    "no-cache"

            },

            body: JSON.stringify({

                students: formatted

            })

        };


    } catch (error) {

        console.error(error);


        return {

            statusCode: 500,

            body: JSON.stringify({

                error:
                    "Unable to retrieve students from Odoo."

            })

        };

    }

};


async function callOdoo(
    model,
    method,
    args
) {

    const url =
        process.env.ODOO_URL;

    const database =
        process.env.ODOO_DATABASE;

    const username =
        process.env.ODOO_USERNAME;

    const password =
        process.env.ODOO_PASSWORD;


    if (
        !url ||
        !database ||
        !username ||
        !password
    ) {

        throw new Error(
            "Odoo environment variables are missing."
        );

    }


    const uid =
        await jsonRpc(
            `${url}/jsonrpc`,
            "call",
            {
                service: "common",

                method: "authenticate",

                args: [
                    database,
                    username,
                    password,
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
                password,
                model,
                method,
                args
            ]
        }
    );

}


async function jsonRpc(
    url,
    method,
    params
) {

    const response =
        await fetch(url, {

            method: "POST",

            headers: {

                "Content-Type":
                    "application/json"

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


    const data =
        await response.json();


    if (data.error) {

        throw new Error(
            data.error.message ||
            "Odoo API error"
        );

    }


    return data.result;

}
