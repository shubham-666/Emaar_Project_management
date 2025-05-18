import React, { useState } from 'react';
import { FaFileExcel, FaEdit, FaEye, FaUserEdit, FaFileUpload, FaCircle, FaBars, FaTimes } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

const INITIAL_PROJECTS = [
  {
    id: 1,
    name: 'Sample Project',
    email: 'project.manager@emaar.ae',
    assignedDate: '2024-02-15',
    deadline: '2024-03-01',
    status: 'pending',
    approvalStatus: 'pending',
    colorCode: 'grey',
    brdRequirement: 'Required',
    brdNotes: '',
    brdFile: null,
    uatSignIn: false,
    uatSignOff: false,
    selected: false,
    stages: {
      BRD: false,
      Develop: false,
      Testing: false,
      UAT: false,
      GoLive: false
    }
  }
];

const COLOR_CODES = {
  red: 'Deadline Exceeded',
  green: 'Ongoing',
  grey: 'New Project',
  yellow: 'Urgent',
  orange: 'Near Deadline',
};

const STAGES = ['BRD', 'Develop', 'Testing', 'UAT', 'GoLive'];

function App() {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [isAdmin, setIsAdmin] = useState(true);
  const [selectAll, setSelectAll] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    email: '',
    assignedDate: format(new Date(), 'yyyy-MM-dd'),
    deadline: '',
    status: 'pending',
    approvalStatus: 'pending',
    colorCode: 'grey',
    brdRequirement: 'Required',
    brdNotes: '',
    brdFile: null,
    uatSignIn: false,
    uatSignOff: false,
    selected: false,
    stages: {
      BRD: false,
      Develop: false,
      Testing: false,
      UAT: false,
      GoLive: false
    }
  });

  const handleExportToExcel = () => {
    const selectedProjects = projects
      .filter(project => project.selected)
      .map(({ selected, brdFile, ...rest }) => rest);
    
    if (selectedProjects.length === 0) {
      alert('Please select at least one project to export');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(selectedProjects);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Projects');
    XLSX.writeFile(wb, 'projects.xlsx');
  };

  const handleAddProject = () => {
    if (!newProject.name || !newProject.deadline || !newProject.email) return;
    setProjects([
      { ...newProject, id: Date.now() },
      ...projects
    ]);
    setNewProject({
      name: '',
      email: '',
      assignedDate: format(new Date(), 'yyyy-MM-dd'),
      deadline: '',
      status: 'pending',
      approvalStatus: 'pending',
      colorCode: 'grey',
      brdRequirement: 'Required',
      brdNotes: '',
      brdFile: null,
      uatSignIn: false,
      uatSignOff: false,
      selected: false,
      stages: {
        BRD: false,
        Develop: false,
        Testing: false,
        UAT: false,
        GoLive: false
      }
    });
  };

  const handleUpdateProject = (id, field, value) => {
    setProjects(projects.map(project => 
      project.id === id ? { ...project, [field]: value } : project
    ));
  };

  const handleStageUpdate = (id, stage) => {
    setProjects(projects.map(project => {
      if (project.id === id) {
        const stageIndex = STAGES.indexOf(stage);
        const updatedStages = { ...project.stages };
        
        for (let i = 0; i <= stageIndex; i++) {
          updatedStages[STAGES[i]] = true;
        }
        for (let i = stageIndex + 1; i < STAGES.length; i++) {
          updatedStages[STAGES[i]] = false;
        }
        
        return { ...project, stages: updatedStages };
      }
      return project;
    }));
  };

  const handleFileUpload = (id, file) => {
    handleUpdateProject(id, 'brdFile', file);
  };

  const toggleUATStatus = (id) => {
    setProjects(projects.map(project => {
      if (project.id === id) {
        if (!project.uatSignIn) {
          return { ...project, uatSignIn: true, uatSignOff: false };
        } else if (!project.uatSignOff) {
          return { ...project, uatSignOff: true };
        } else {
          return { ...project, uatSignIn: false, uatSignOff: false };
        }
      }
      return project;
    }));
  };

  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
    setProjects(projects.map(project => ({ ...project, selected: !selectAll })));
  };

  const toggleProjectSelection = (id) => {
    setProjects(projects.map(project =>
      project.id === id ? { ...project, selected: !project.selected } : project
    ));
  };

  return (
    <div className="min-h-screen bg-burj">
      <nav className="bg-[#071C35] shadow-lg fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/f/fd/Emaar_logo.svg"
                alt="Emaar Logo"
                className="h-8 w-auto"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>
            
            <div className="flex-1 text-center">
              <span className="text-2xl font-bold text-white">Project Management</span>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => setIsAdmin(!isAdmin)}
                className="bg-white/20 text-white px-4 py-2 rounded hover:bg-white/30 transition-colors"
              >
                {isAdmin ? 'Switch to User' : 'Switch to Admin'}
              </button>
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white p-2"
              >
                {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button
              onClick={() => {
                setIsAdmin(!isAdmin);
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-white hover:bg-white/20"
            >
              {isAdmin ? 'Switch to User' : 'Switch to Admin'}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8 pt-24">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-white">Project Dashboard</h1>
          <button
            onClick={handleExportToExcel}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full sm:w-auto justify-center"
          >
            <FaFileExcel /> Export Selected
          </button>
        </div>

        {isAdmin && (
          <div className="bg-white/95 p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">Add New Project</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Project Name"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                className="border p-2 rounded"
              />
              <input
                type="email"
                placeholder="Project Manager Email"
                value={newProject.email}
                onChange={(e) => setNewProject({ ...newProject, email: e.target.value })}
                className="border p-2 rounded"
              />
              <input
                type="date"
                value={newProject.deadline}
                onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                className="border p-2 rounded"
              />
              <select
                value={newProject.colorCode}
                onChange={(e) => setNewProject({ ...newProject, colorCode: e.target.value })}
                className="border p-2 rounded"
              >
                {Object.entries(COLOR_CODES).map(([code, label]) => (
                  <option key={code} value={code}>{label}</option>
                ))}
              </select>
              <select
                value={newProject.brdRequirement}
                onChange={(e) => setNewProject({ ...newProject, brdRequirement: e.target.value })}
                className="border p-2 rounded"
              >
                <option value="Required">Low Level Project</option>
                <option value="required">Medium Level Project</option>
                <option value="Not Required">High Level Project</option>
              </select>
              <textarea
                placeholder="BRD Notes"
                value={newProject.brdNotes}
                onChange={(e) => setNewProject({ ...newProject, brdNotes: e.target.value })}
                className="border p-2 rounded"
              />
              <button
                onClick={handleAddProject}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Add Project
              </button>
            </div>
          </div>
        )}

        <div className="bg-white/95 rounded-lg shadow-md overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approval</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Stages</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BRD</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UAT Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projects.map((project) => (
                <tr key={project.id} className={`bg-${project.colorCode}-50`}>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={project.selected}
                      onChange={() => toggleProjectSelection(project.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 bg-${project.colorCode}-500`}></div>
                      {project.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{project.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{project.assignedDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{project.deadline}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={project.status}
                      onChange={(e) => handleUpdateProject(project.id, 'status', e.target.value)}
                      className="border rounded p-1"
                      disabled={!isAdmin}
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={project.approvalStatus}
                      onChange={(e) => handleUpdateProject(project.id, 'approvalStatus', e.target.value)}
                      className="border rounded p-1"
                      disabled={!isAdmin}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {STAGES.map((stage) => (
                        <div key={stage} className="flex flex-col items-center">
                          <button
                            onClick={() => handleStageUpdate(project.id, stage)}
                            className={`w-4 h-4 rounded-full ${
                              project.stages[stage] ? 'bg-green-500' : 'bg-red-500'
                            } hover:opacity-80 transition-opacity`}
                            title={stage}
                          />
                          <span className="text-xs mt-1">{stage}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span>{project.brdRequirement}</span>
                        <input
                          type="file"
                          id={`brd-${project.id}`}
                          className="hidden"
                          accept=".pdf,.jpg,.xlsx,.xls"
                          onChange={(e) => handleFileUpload(project.id, e.target.files[0])}
                        />
                        <label
                          htmlFor={`brd-${project.id}`}
                          className="cursor-pointer text-blue-600 hover:text-blue-800"
                        >
                          <FaFileUpload />
                        </label>
                        {project.brdFile && (
                          <span className="text-sm text-gray-600">{project.brdFile.name}</span>
                        )}
                      </div>
                      <textarea
                        value={project.brdNotes}
                        onChange={(e) => handleUpdateProject(project.id, 'brdNotes', e.target.value)}
                        placeholder="BRD Notes"
                        className="border rounded p-1 text-sm w-full"
                        rows="2"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleUATStatus(project.id)}
                      className={`px-3 py-1 rounded text-white ${
                        !project.uatSignIn
                          ? 'bg-blue-500 hover:bg-blue-600'
                          : project.uatSignOff
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'bg-yellow-500 hover:bg-yellow-600'
                      }`}
                    >
                      {!project.uatSignIn
                        ? 'Sign In'
                        : project.uatSignOff
                        ? 'Completed'
                        : 'Sign Off'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      {isAdmin ? (
                        <FaEdit className="text-blue-600 cursor-pointer" />
                      ) : (
                        <FaEye className="text-gray-600 cursor-pointer" />
                      )}
                      <FaUserEdit className="text-green-600 cursor-pointer" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;