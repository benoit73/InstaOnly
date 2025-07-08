import { User, Account } from '../models';

export async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Créer des utilisateurs de test
    const user1 = await User.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
      }
    });

    const user2 = await User.findOrCreate({
      where: { username: 'demo_user' },
      defaults: {
        username: 'demo_user',
        email: 'demo@example.com',
        password: 'demo123',
      }
    });

    // Créer des comptes de test
    const account1 = await Account.findOrCreate({
      where: { name: 'Personal Account' },
      defaults: {
        name: 'Personal Account',
        description: 'Personal image generation account',
        userId: user1[0].id,
      }
    });

    const account2 = await Account.findOrCreate({
      where: { name: 'Business Account' },
      defaults: {
        name: 'Business Account',
        description: 'Business image generation account',
        userId: user1[0].id,
      }
    });

    const account3 = await Account.findOrCreate({
      where: { name: 'Demo Account' },
      defaults: {
        name: 'Demo Account',
        description: 'Demo user account for testing',
        userId: user2[0].id,
      }
    });

    console.log('Test users and accounts created successfully!');
    console.log('Database seeded successfully!');
    
    return {
      users: [user1[0], user2[0]],
      accounts: [account1[0], account2[0], account3[0]]
    };
    
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}