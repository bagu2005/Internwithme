import bcrypt from 'bcryptjs';
import { pool } from '../config/database';

const createTestUser = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Creating test user...');
    
    // Check if test user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      ['test@internwithme.com']
    );
    
    if (existingUser.rows.length > 0) {
      console.log('✅ Test user already exists');
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    // Create test user
    const result = await client.query(`
      INSERT INTO users (
        first_name, last_name, email, password, role, is_verified, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, email, role
    `, [
      'Test',
      'User',
      'test@internwithme.com',
      hashedPassword,
      'intern',
      true,
      true
    ]);
    
    const user = result.rows[0];
    console.log('✅ Test user created:', user);
    
    // Create intern profile
    await client.query(`
      INSERT INTO intern_profiles (
        user_id, university, major, graduation_year, skills, interests, location, bio
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      user.id,
      'Test University',
      'Computer Science',
      2024,
      ['JavaScript', 'React', 'Node.js', 'Python'],
      ['Web Development', 'Machine Learning', 'Startups'],
      'San Francisco, CA',
      'Passionate about technology and looking for internship opportunities.'
    ]);
    
    console.log('✅ Test user profile created');
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Run if called directly
if (require.main === module) {
  createTestUser()
    .then(() => {
      console.log('🎉 Test user creation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Test user creation failed:', error);
      process.exit(1);
    });
}

export { createTestUser };
