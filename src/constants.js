const homeIcon = require('./assets/svg/ic_home.svg');
const receivables = require('./assets/svg/ic_receivable.svg');
const settings = require('./assets/svg/ic_settings.svg');
const design = require('./assets/svg/ic_settings.svg');
const designs = require('./assets/svg/ic_burger.svg');
const repo = require('./assets/svg/ic_repo.png');
const upload = require('./assets/svg/ic_upload.gif');
const jobs = require('./assets/svg/ic_tasks.svg');
const tasks = require('./assets/svg/ic_tasks.svg');
const signout = require('./assets/svg/signout.svg');
const help = require('./assets/svg/ic_help.png');
const users = require('./assets/svg/ic_users.png');
const udmLogo = require('./assets/png/udm_logo.png');
const reportsIcon = require('./assets/svg/ic_reports.svg');
const generator = require('./assets/svg/ic_newfolder.svg');

const imagePaths = {
  home: homeIcon,
  receivables,
  settings,
  design,
  designs,
  repo,
  upload,
  jobs,
  tasks,
  udmLogo,
  signout,
  reportsIcon,
  help,
  users,
  generator
};

export const notificationTypes = {
  normal: 'NORMAL',
  success: 'SUCCESS',
  warning: 'WARNING',
  error: 'ERROR'
};

export default {
  imagePaths
};

