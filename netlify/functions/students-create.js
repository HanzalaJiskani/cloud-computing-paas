import { getStore } from '@netlify/blobs';

export default async function (event) {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Method not allowed." })
        };
    }

    try {
        const body = JSON.parse(event.body || "{}");
        const { name, email, phone, course } = body;

        if (!name || !email || !course) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Name, email and course are required." })
            };
        }

        // Get the built-in Netlify database store
        const studentsStore = getStore('students');
        const studentId = 'student_' + Date.now();

        const studentData = {
            id: studentId,
            name: name,
            email: email,
            phone: phone || "",
            course: course,
            createdAt: new Date().toISOString()
        };

        // Save directly to Netlify storage
        await studentsStore.setJSON(studentId, studentData);

        return {
            statusCode: 201,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ success: true, result: studentData })
        };

    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Unable to save student data." })
        };
    }
};
