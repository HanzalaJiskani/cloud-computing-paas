exports.handler = async function (event) {

    if (event.httpMethod !== "GET") {

        return {

            statusCode: 405,

            body: JSON.stringify({

                error:
                    "Method not allowed."

            })

        };

    }


    try {

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

            `${url}/json/2/res.partner/search_read`,

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

                    domain: [

                        [
                            "comment",
                            "ilike",
                            "Student Course:"
                        ]

                    ],

                    fields: [

                        "id",
                        "name",
                        "email",
                        "phone",
                        "comment"

                    ],

                    context: {

                        lang: "en_US"

                    }

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
                        "Unable to retrieve students from Odoo.",

                    details:
                        responseText

                })

            };

        }


        const students =
            JSON.parse(responseText);


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
                        comment
                            .replace(
                                "Student Course:",
                                ""
                            )
                            .trim();

                }


                return {

                    id:
                        student.id,

                    name:
                        student.name || "",

                    email:
                        student.email || "",

                    phone:
                        student.phone || "",

                    course:
                        course

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

                students:
                    formatted

            })

        };


    } catch (error) {

        console.error(error);

        return {

            statusCode: 500,

            body: JSON.stringify({

                error:
                    "Unable to retrieve students."

            })

        };

    }

};
