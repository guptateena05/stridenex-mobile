const axios = require('axios');

async function test() {
  try {
    const res = await axios.get('https://devstridenex.quantcloud.in/api/method/stridenex_app.api_stridenex_app.student.student.get_student_by_email?email_id=teena.gupta@quantbit.in');
    console.log(JSON.stringify(res.data, null, 2).slice(0, 500));
  } catch (err) {
    console.error("Error", err.response ? err.response.data : err.message);
  }
}
test();
