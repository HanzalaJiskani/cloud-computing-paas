import { getStore } from '@netlify/blobs';

export default async function (event) {
    if (event.httpMethod !== "GET") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Method not allowed." })
        };
    }

    try {
        const studentsStore = getStore('students');
        const { blobs } = await studentsStore.list();

        const students = [];
        for (const blob of blobs) {
            const student = await studentsStore.getJSON(blob.key);
            if (student) {
                students.push(student);
            }
        }

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache"
            },
            body: JSON.stringify({ students })
        };

    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Unable to retrieve students." })
        };
    }
};
