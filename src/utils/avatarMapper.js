// Worker Avatars
import worker1 from '../assets/avatars/worker/workeravatar2.png';
import worker2 from '../assets/avatars/worker/workeravatar3.png';
import worker3 from '../assets/avatars/worker/workeravatar4.png';
import worker4 from '../assets/avatars/worker/workeravatar5.png';
import worker5 from '../assets/avatars/worker/workeravatar6.png';
import worker6 from '../assets/avatars/worker/workeravatar7.png';
import worker7 from '../assets/avatars/worker/workeravatar8.png';
import worker8 from '../assets/avatars/worker/workeravatar9.png';
import worker9 from '../assets/avatars/worker/workeravatar10.png';
import workerMale from '../assets/avatars/worker/worker_male.png';
import workerFemale from '../assets/avatars/worker/worker_female.png';

// Employee Avatars
import emp1 from '../assets/avatars/employee/employeavatar2.png';
import emp2 from '../assets/avatars/employee/employeavatar3.png';
import emp3 from '../assets/avatars/employee/employeavatar4.png';
import emp4 from '../assets/avatars/employee/employeavatar5.png';
import empMale from '../assets/avatars/employee/male.png';
import empFemale from '../assets/avatars/employee/female.png';

const avatarMap = {
  // Workers
  'worker_male': workerMale,
  'worker_female': workerFemale,
  'worker2': worker1,
  'worker3': worker2,
  'worker4': worker3,
  'worker5': worker4,
  'worker6': worker5,
  'worker7': worker6,
  'worker8': worker7,
  'worker9': worker8,
  'worker10': worker9,
  'male_worker': workerMale,
  'female_worker': workerFemale,

  // Employees
  'male': empMale,
  'female': empFemale,
  'emp2': emp1,
  'emp3': emp2,
  'emp4': emp3,
  'emp5': emp4,
  'employer_male': empMale,
  'employer_female': empFemale,
};

export const getAvatarPath = (avatarId, gender, role, name) => {
  // If it's a direct URL or path
  if (avatarId && (avatarId.startsWith('http') || avatarId.startsWith('/src') || avatarId.startsWith('data:'))) {
    return avatarId;
  }

  // Try mapping by ID
  if (avatarMap[avatarId]) {
    return avatarMap[avatarId];
  }

  // Fallback to role + gender
  const isWorker = role === 'worker';
  if (avatarId === 'male' || gender === 'male') {
    return isWorker ? workerMale : empMale;
  }
  if (avatarId === 'female' || gender === 'female') {
    return isWorker ? workerFemale : empFemale;
  }

  // Final fallback: UI Avatars
  return `https://ui-avatars.com/api/?name=${name || 'User'}&background=${isWorker ? '10b981' : '6366f1'}&color=fff`;
};

export default avatarMap;
