import React from 'react';
import { getStudents } from '../../../services/studentsService';
import GenericList from '../../../components/Generic/GenericList';

const StudentsList = () => {
  // Configuration for the student list
  const studentConfig = {
    title: "Student List",
    fetchItems: getStudents,
    columns: [
      { key: 'cin', header: 'CIN' },
      { key: 'name', header: 'Name' },
      { key: 'email', header: 'Email' },
      { key: 'level', header: 'Level' },
      { key: 'integrationYear', header: 'Integration Year' },
      { key: 'status', header: 'Status' },
    ],
    statusMap: {
      passe: { label: "Passe", variant: "success" },
      redouble: { label: "Redouble", variant: "danger" },
      diplomé: { label: "diplomé", variant: "warning" },
    },
    customRenderers: {
      name: (student) => (
        <td key="name">
          <h6 className="mb-1">
            {student.firstName} {student.lastName}
          </h6>
          {student.arabicName && (
            <p className="m-0 text-muted small">{student.arabicName}</p>
          )}
        </td>
      )
    },
    searchFields: ['firstName', 'lastName', 'cin', 'email'],
    noItemsMessage: "No students found"
  };

  return <GenericList {...studentConfig} />;
};

export default StudentsList;