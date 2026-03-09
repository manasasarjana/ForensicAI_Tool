const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function testUpload() {
    try {
        let token;
        try {
            const regRes = await axios.post('http://localhost:3001/api/auth/register', {
                firstName: 'Test',
                lastName: 'Agent',
                username: 'test_agent' + Date.now(),
                email: 'test_agent' + Date.now() + '@forensics.com',
                password: 'password123',
                role: 'investigator'
            });
            token = regRes.data.accessToken;
            console.log('Registered and got token.');
        } catch (e) {
            console.error('Failed to register:', e.message);
            return;
        }

        const casesRes = await axios.get('http://localhost:3001/api/cases', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const firstCase = casesRes.data.cases[0];
        if (!firstCase) {
            console.log('No cases found in DB. Automatically creating a case to test...');
            return;
        }
        console.log(`Found case: ${firstCase._id}`);

        const form = new FormData();
        form.append('caseId', firstCase._id);
        form.append('description', 'Test evidence');

        fs.writeFileSync('test-evidence.txt', 'This is a test evidence file content.');
        form.append('evidence', fs.createReadStream('test-evidence.txt'));

        console.log('Uploading evidence...');
        const uploadRes = await axios.post('http://localhost:3001/api/evidence/upload', form, {
            headers: {
                ...form.getHeaders(),
                Authorization: `Bearer ${token}`
            }
        });

        console.log('Upload success:', uploadRes.data);
        fs.unlinkSync('test-evidence.txt');

        console.log('Generating Report...');
        const reportRes = await axios.post('http://localhost:3001/api/reports/generate-ai', {
            caseId: firstCase._id
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Report Generation Success');

    } catch (error) {
        console.error('Test failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

testUpload();
