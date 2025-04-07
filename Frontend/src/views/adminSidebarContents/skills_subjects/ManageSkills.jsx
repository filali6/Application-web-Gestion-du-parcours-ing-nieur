import React, { useEffect, useState } from 'react';
import { Button, Form, Modal, Spinner, Table } from 'react-bootstrap';
import Swal from 'sweetalert2';
import Select from 'react-select';

import { getSkills, getArchivedSkills, createSkill, updateSkill, deleteSkill } from '../../../services/skills.service';
import { getSubjects } from '../../../services/subjects.service';

const ITEMS_PER_PAGE = 5;

const ManageSkills = () => {
  const [skills, setSkills] = useState([]);
  const [archivedSkills, setArchivedSkills] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [tab, setTab] = useState('active');

  const [form, setForm] = useState({ name: '', description: '', subjects: [] });

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const active = await getSkills();
      const archived = await getArchivedSkills();
      setSkills(active || []);
      setArchivedSkills(archived.archivedSkills || []);
    } catch (err) {
      // Optional error handling
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const data = await getSubjects();
      const formatted = data.map((subj) => ({
        value: subj._id || subj.id,
        label: subj.title
      }));
      setSubjects(formatted);
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
    }
  };

  useEffect(() => {
    fetchSkills();
    fetchSubjects();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubjectSelect = (selectedOptions) => {
    setForm((prev) => ({
      ...prev,
      subjects: selectedOptions.map((opt) => opt.value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (editingSkill && editingSkill.subjects.length > 0) payload.force = true;
      if (editingSkill) await updateSkill(editingSkill.id || editingSkill._id, payload);
      else await createSkill(payload);
      await fetchSkills();
      setForm({ name: '', description: '', subjects: [] });
      setEditingSkill(null);
      setShowModal(false);
      Swal.fire('Success', `Skill ${editingSkill ? 'updated' : 'created'} successfully.`, 'success');
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Skill operation failed.', 'error');
    }
  };

  const handleEdit = async (skill) => {
    if (skill.subjects?.length > 0) {
      const confirm = await Swal.fire({
        title: 'Edit Linked Skill?',
        text: 'This skill is linked to subjects. Proceed?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes'
      });
      if (!confirm.isConfirmed) return;
    }
    setEditingSkill(skill);
    setForm({
      name: skill.name,
      description: skill.description,
      subjects: skill.subjects.map((s) => s.id || s._id)
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this skill?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (confirm.isConfirmed) {
      try {
        await deleteSkill(id);
        await fetchSkills();
        Swal.fire('Deleted!', 'Skill deleted successfully.', 'success');
      } catch (err) {
        const msg = err.response?.data?.message || 'Delete failed';
        if (msg.includes('linked')) {
          const archiveConfirm = await Swal.fire({
            title: 'Cannot Delete',
            text: 'This skill is linked to subjects. Archive instead?',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Yes, archive'
          });
          if (archiveConfirm.isConfirmed) {
            await deleteSkill(id, true);
            await fetchSkills();
            Swal.fire('Archived!', 'Skill archived.', 'success');
          }
        } else {
          Swal.fire('Error', msg, 'error');
        }
      }
    }
  };

  const filtered = (tab === 'active' ? skills : archivedSkills).filter((skill) =>
    skill.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pageCount = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const renderPagination = () => {
    const pages = [];
    const visiblePages = 3;
    const startPage = Math.max(1, currentPage - visiblePages);
    const endPage = Math.min(pageCount, currentPage + visiblePages);

    if (currentPage > 1) {
      pages.push(
        <Button key="first" size="sm" onClick={() => setCurrentPage(1)}>
          {'<<'}
        </Button>
      );
      pages.push(
        <Button key="prev" size="sm" onClick={() => setCurrentPage(currentPage - 1)}>
          {'<'}
        </Button>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? 'primary' : 'outline-secondary'}
          size="sm"
          className="me-1"
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </Button>
      );
    }

    if (currentPage < pageCount) {
      pages.push(
        <Button key="next" size="sm" onClick={() => setCurrentPage(currentPage + 1)}>
          {'>'}
        </Button>
      );
      pages.push(
        <Button key="last" size="sm" onClick={() => setCurrentPage(pageCount)}>
          {'>>'}
        </Button>
      );
    }

    return <div className="d-flex justify-content-center mt-3 flex-wrap gap-1">{pages}</div>;
  };

  return (
    <div className="p-4">
      {/* Top tabs */}
      <div className="mb-3" style={{ background: '#fff', padding: '1rem' }}>
        <div className="d-flex gap-4">
          <button className={`btn ${tab === 'active' ? 'btn-primary shadow' : 'btn-link text-primary'}`} onClick={() => setTab('active')}>
            Active Skills
          </button>
          <button
            className={`btn ${tab === 'archived' ? 'btn-primary shadow' : 'btn-link text-primary'}`}
            onClick={() => setTab('archived')}
          >
            Archived Skills
          </button>
        </div>
      </div>

      {/* Search + Add */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Form.Control
          placeholder="Search by skill name"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          style={{ maxWidth: '300px' }}
        />
        {tab === 'active' && (
          <Button
            variant="info"
            onClick={() => {
              setEditingSkill(null);
              setForm({ name: '', description: '', subjects: [] });
              setShowModal(true);
            }}
          >
            + Add Skill
          </Button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <Table bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Skill Name</th>
                  <th>Description</th>
                  <th>Subjects</th>
                  {tab === 'active' && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {paginated.map((skill, index) => (
                  <tr key={skill.id}>
                    <td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                    <td>{skill.name}</td>
                    <td>{skill.description || '-'}</td>
                    <td>{skill.subjects.map((s) => s.title).join(', ') || '-'}</td>
                    {tab === 'active' && (
                      <td>
                        <Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(skill)}>
                          Edit
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(skill.id)}>
                          Delete
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {pageCount > 1 && renderPagination()}
        </>
      )}

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingSkill ? 'Edit Skill' : 'Add Skill'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Skill Name</Form.Label>
              <Form.Control type="text" name="name" value={form.name} onChange={handleFormChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" name="description" value={form.description} onChange={handleFormChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Subjects</Form.Label>
              <Select
                isMulti
                options={subjects}
                value={subjects.filter((subj) => form.subjects.includes(subj.value))}
                onChange={handleSubjectSelect}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingSkill ? 'Update' : 'Create'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageSkills;
