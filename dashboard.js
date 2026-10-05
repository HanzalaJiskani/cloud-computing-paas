let allStudents = [];


async function loadStudents() {

    const table =
        document.getElementById("studentsTable");

    table.innerHTML = `
        <tr>
            <td colspan="4">
                Loading students...
            </td>
        </tr>
    `;


    try {

        const response = await fetch(
            "/.netlify/functions/students-list"
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to load students."
            );

        }


        allStudents = data.students || [];


        renderStudents(allStudents);


    } catch (error) {

        console.error(error);

        table.innerHTML = `
            <tr>
                <td colspan="4">
                    Unable to load student data.
                </td>
            </tr>
        `;

    }

}


function renderStudents(students) {

    const table =
        document.getElementById("studentsTable");


    document.getElementById("totalStudents")
        .textContent = students.length;


    if (students.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="4">
                    No students found.
                </td>
            </tr>
        `;

        return;

    }


    table.innerHTML = students.map(student => {

        return `
            <tr>

                <td>
                    ${escapeHtml(student.name)}
                </td>

                <td>
                    ${escapeHtml(student.email)}
                </td>

                <td>
                    ${escapeHtml(student.phone || "-")}
                </td>

                <td>
                    ${escapeHtml(student.course || "-")}
                </td>

            </tr>
        `;

    }).join("");

}


function escapeHtml(value) {

    const div = document.createElement("div");

    div.textContent = value ?? "";

    return div.innerHTML;

}


document
    .getElementById("searchInput")
    .addEventListener("input", function () {

        const search =
            this.value.toLowerCase().trim();


        const filtered =
            allStudents.filter(student => {

                return (

                    String(student.name || "")
                        .toLowerCase()
                        .includes(search)

                    ||

                    String(student.email || "")
                        .toLowerCase()
                        .includes(search)

                    ||

                    String(student.course || "")
                        .toLowerCase()
                        .includes(search)

                );

            });


        renderStudents(filtered);

    });


loadStudents();
