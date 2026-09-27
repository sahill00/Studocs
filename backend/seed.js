const db = require('./db');
const bcrypt = require('bcrypt');

async function seed() {
  try {
    console.log('Seeding database...');
    
    // 1. Create a mock user
    const password_hash = await bcrypt.hash('password123', 10);
    const userResult = await db.query(
      `INSERT INTO users (full_name, email, password_hash, college_name, branch, year_of_study, reputation_score) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       ON CONFLICT (email) DO NOTHING RETURNING id`,
      ['Jane Doe', 'jane@college.edu', password_hash, 'IIIT Hyderabad', 'CSE', 3, 450]
    );
    
    // If user already exists, fetch their ID
    let userId;
    if (userResult.rows.length > 0) {
      userId = userResult.rows[0].id;
    } else {
      const existingUser = await db.query('SELECT id FROM users WHERE email = $1', ['jane@college.edu']);
      userId = existingUser.rows[0].id;
    }

    // 2. Insert mock notes
    const mockNotes = [
      {
        title: 'Complete Data Structures & Algorithms from Cormen',
        description: 'Comprehensive textbook notes covering arrays, linked lists, trees, graphs, and dynamic programming. Very structured with examples.',
        note_type: 'TEXTBOOK',
        difficulty_level: 'Advanced',
        file_url: 'https://example.com/dsa-notes.pdf',
        branch: 'CSE',
        academic_year: 2,
        semester: 3,
        view_count: 1245,
        avg_rating: 4.8
      },
      {
        title: 'Database Systems (DBMS) - Prof. Smith Lectures',
        description: 'Handwritten lecture notes from Sem 5. Contains ER diagrams, Normalization up to BCNF, and SQL queries.',
        note_type: 'HANDWRITTEN',
        difficulty_level: 'Intermediate',
        file_url: 'https://example.com/dbms-notes.pdf',
        branch: 'CSE',
        academic_year: 3,
        semester: 5,
        view_count: 850,
        avg_rating: 4.5
      },
      {
        title: 'Thermodynamics Core Concepts Quick Review',
        description: 'Short textbook summary of laws of thermodynamics, Carnot cycle, and entropy. Perfect for last-minute midterm review.',
        note_type: 'TEXTBOOK',
        difficulty_level: 'Beginner',
        file_url: 'https://example.com/thermo-notes.pdf',
        branch: 'Mechanical',
        academic_year: 2,
        semester: 4,
        view_count: 420,
        avg_rating: 4.2
      },
      {
        title: 'Digital Logic & Circuit Design Lab Manual',
        description: 'Handwritten lab readings, boolean algebra simplifications, and K-map solutions.',
        note_type: 'HANDWRITTEN',
        difficulty_level: 'Intermediate',
        file_url: 'https://example.com/dld-notes.pdf',
        branch: 'ECE',
        academic_year: 1,
        semester: 2,
        view_count: 310,
        avg_rating: 4.9
      },
      {
        title: 'Operating Systems - Process Synchronization',
        description: 'Detailed handwritten notes on semaphores, mutexes, and deadlocks. Includes classical synchronization problems.',
        note_type: 'HANDWRITTEN',
        difficulty_level: 'Advanced',
        file_url: 'https://example.com/os-sync.pdf',
        branch: 'CSE',
        academic_year: 3,
        semester: 5,
        view_count: 980,
        avg_rating: 4.6
      },
      {
        title: 'Microprocessors and Microcontrollers',
        description: '8085 and 8086 architectures, instruction sets, and assembly language programming basics.',
        note_type: 'TEXTBOOK',
        difficulty_level: 'Intermediate',
        file_url: 'https://example.com/mpmc.pdf',
        branch: 'ECE',
        academic_year: 2,
        semester: 4,
        view_count: 750,
        avg_rating: 4.4
      },
      {
        title: 'Strength of Materials - Bending Moments',
        description: 'Notes on shear force and bending moment diagrams for various types of beams.',
        note_type: 'HANDWRITTEN',
        difficulty_level: 'Beginner',
        file_url: 'https://example.com/som.pdf',
        branch: 'Civil',
        academic_year: 2,
        semester: 3,
        view_count: 512,
        avg_rating: 4.3
      },
      {
        title: 'Computer Networks - OSI and TCP/IP',
        description: 'Comprehensive guide to the network stack, IP addressing, and routing algorithms.',
        note_type: 'TEXTBOOK',
        difficulty_level: 'Intermediate',
        file_url: 'https://example.com/cn.pdf',
        branch: 'CSE',
        academic_year: 3,
        semester: 6,
        view_count: 1100,
        avg_rating: 4.7
      },
      {
        title: 'Engineering Mathematics - Linear Algebra',
        description: 'Matrices, determinants, eigenvalues, eigenvectors, and their applications in engineering.',
        note_type: 'HANDWRITTEN',
        difficulty_level: 'Advanced',
        file_url: 'https://example.com/math-la.pdf',
        branch: 'Common',
        academic_year: 1,
        semester: 1,
        view_count: 1560,
        avg_rating: 4.1
      },
      {
        title: 'Software Engineering - Agile Methodologies',
        description: 'Scrum, Kanban, XP, and SDLC models overview. Good for end-semester prep.',
        note_type: 'TEXTBOOK',
        difficulty_level: 'Beginner',
        file_url: 'https://example.com/se-agile.pdf',
        branch: 'IT',
        academic_year: 3,
        semester: 6,
        view_count: 670,
        avg_rating: 4.5
      },
      {
        title: 'Power Systems Analysis',
        description: 'Fault analysis, load flow studies, and stability criteria for electrical grids.',
        note_type: 'HANDWRITTEN',
        difficulty_level: 'Advanced',
        file_url: 'https://example.com/psa.pdf',
        branch: 'EEE',
        academic_year: 4,
        semester: 7,
        view_count: 890,
        avg_rating: 4.8
      },
      {
        title: 'Theory of Computation - Automata',
        description: 'DFA, NFA, Context Free Grammars, and Turing Machines simplified.',
        note_type: 'TEXTBOOK',
        difficulty_level: 'Intermediate',
        file_url: 'https://example.com/toc.pdf',
        branch: 'CSE',
        academic_year: 2,
        semester: 4,
        view_count: 1320,
        avg_rating: 4.6
      },
      {
        title: 'Fluid Mechanics Notes',
        description: 'Bernoulli’s equation, fluid kinematics, and dynamics with solved numericals.',
        note_type: 'HANDWRITTEN',
        difficulty_level: 'Intermediate',
        file_url: 'https://example.com/fluid.pdf',
        branch: 'Mechanical',
        academic_year: 2,
        semester: 3,
        view_count: 430,
        avg_rating: 4.2
      },
      {
        title: 'Control Systems - Root Locus',
        description: 'Techniques for plotting root locus and determining system stability.',
        note_type: 'TEXTBOOK',
        difficulty_level: 'Advanced',
        file_url: 'https://example.com/cs-root.pdf',
        branch: 'ECE',
        academic_year: 3,
        semester: 5,
        view_count: 550,
        avg_rating: 4.7
      },
      {
        title: 'Artificial Intelligence - Search Algorithms',
        description: 'A*, BFS, DFS, and heuristic search methodologies explained with examples.',
        note_type: 'HANDWRITTEN',
        difficulty_level: 'Beginner',
        file_url: 'https://example.com/ai-search.pdf',
        branch: 'CSE',
        academic_year: 4,
        semester: 7,
        view_count: 1450,
        avg_rating: 4.9
      }
    ];

    // Insert notes
    for (const note of mockNotes) {
      await db.query(
        `INSERT INTO notes 
         (title, description, note_type, difficulty_level, file_url, branch, academic_year, semester, view_count, avg_rating, uploader_id) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [note.title, note.description, note.note_type, note.difficulty_level, note.file_url, note.branch, note.academic_year, note.semester, note.view_count, note.avg_rating, userId]
      );
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    process.exit(0);
  }
}

seed();
