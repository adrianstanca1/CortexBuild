import bcrypt from 'bcrypt';

const password = process.argv[2];

if (!password) {
  console.error('Usage: npm run hash-password -- <password>');
  process.exit(1);
}

const rounds = Number(process.env.BCRYPT_ROUNDS ?? 12);

bcrypt.hash(password, rounds).then((hash) => {
  console.log(hash);
});
