import { User, Account } from '../models';

export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Créer des utilisateurs de test
    const users = [
      {
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123'
      },
      {
        username: 'demo_user',
        email: 'demo@example.com',
        password: 'demo123'
      },
      {
        username: 'john_doe',
        email: 'john@example.com',
        password: 'password123'
      },
      {
        username: 'jane_smith',
        email: 'jane@example.com',
        password: 'password456'
      },
      {
        username: 'alice_wilson',
        email: 'alice@example.com',
        password: 'alice123'
      }
    ];

    const createdUsers = [];
    for (const userData of users) {
      const [user, created] = await User.findOrCreate({
        where: { username: userData.username },
        defaults: userData
      });
      
      if (created) {
        console.log(`✅ User created: ${user.username}`);
      } else {
        console.log(`🔄 User already exists: ${user.username}`);
      }
      
      createdUsers.push(user);
    }

    // Créer des comptes de test
    const accounts = [
      {
        name: 'Personal Account',
        description: 'Personal image generation account',
        userId: createdUsers[0].id // admin
      },
      {
        name: 'Business Account',
        description: 'Business image generation account',
        userId: createdUsers[0].id // admin
      },
      {
        name: 'Demo Account',
        description: 'Demo user account for testing',
        userId: createdUsers[1].id // demo_user
      },
      {
        name: 'John Photography',
        description: 'Photography portfolio account',
        userId: createdUsers[2].id // john_doe
      },
      {
        name: 'Jane Creative',
        description: 'Creative content account',
        userId: createdUsers[3].id // jane_smith
      },
      {
        name: 'Alice Studio',
        description: 'Professional studio account',
        userId: createdUsers[4].id // alice_wilson
      },
      {
        name: 'Marketing Team',
        description: 'Team account for marketing content',
        userId: createdUsers[0].id // admin
      },
      {
        name: 'Social Media',
        description: 'Social media content creation',
        userId: createdUsers[1].id // demo_user
      }
    ];

    for (const accountData of accounts) {
      const [account, created] = await Account.findOrCreate({
        where: { 
          name: accountData.name,
          userId: accountData.userId 
        },
        defaults: accountData
      });
      
      if (created) {
        console.log(`✅ Account created: ${account.name} (User: ${createdUsers.find(u => u.id === account.userId)?.username})`);
      } else {
        console.log(`🔄 Account already exists: ${account.name}`);
      }
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Total users: ${createdUsers.length}`);
    console.log(`📊 Total accounts: ${accounts.length}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}