const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const redis = require('redis');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.DATABASE_URL || 'mongodb://localhost:27017/apresente-se';
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || '';

app.use(cors());
app.use(bodyParser.json());

const client = redis.createClient({
  host: 'localhost',
  port: 6379,
  password: REDIS_PASSWORD, 
});

client.on('connect', () => {
  console.log('Conectado ao Redis');
});

mongoose.connect(MONGO_URI, {})
  .then(() => console.log('Conectado ao MongoDB!'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

const bioSchema = new mongoose.Schema({
  k: { type: String, required: true },
  name: { type: String, required: true },
  area: { type: String, required: true },
  bio: { type: String, required: true },
  linkedin: { type: String, required: false },
  instagram: { type: String, required: false },
  x: { type: String, required: false },
  profileImageUrl: { type: String, required: false },
});

const Bio = mongoose.model('Bio', bioSchema);

async function getInstagramProfileMeta(url) {
  try {
    const { data } = await axios.get(url, { headers: {
      'User-Agent': 'Mozilla/5.0'
    }});
    const $ = cheerio.load(data);
    const profileImage = $("meta[property='og:image']").attr('content');    

    if (profileImage) {
      return profileImage;
    } else {
      console.error('Não foi possível obter a imagem de perfil');
      return null;
    }
  } catch (error) {
    console.error('Erro ao obter metadados do Instagram:', error.message);
    return null;
  }
}

app.get('/api/profile/image', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  return res.status(200).json(await getInstagramProfileMeta(url));
});

app.post('/api/bios', async (req, res) => {
  try {
    const { name, area, bio, linkedin, instagram, x, k } = req.body;

    if (!k) {
      return res.status(400).json({ error: 'Você precisa de uma chave para acessar: solicite ao administrador da turma.' });
    }

    if (!name || !bio) {
      return res.status(400).json({ error: 'Nome e bio são obrigatórios.' });
    }

    const profileImage = await getInstagramProfileMeta(instagram);
    const newBio = new Bio({ name, area, bio, linkedin, instagram, x, k, profileImage });
    await newBio.save();

    client.del(k, (err) => {
      if (err) {
        console.error('Erro ao limpar o cache', err);
      }
    });

    res.status(201).json({ message: 'Bio salva com sucesso!', data: newBio });
  } catch (err) {
    console.error('Erro ao salvar bio:', err);
    res.status(500).json({ error: 'Erro ao salvar bio.' });
  }
});

app.get('/api/bios', async (req, res) => {
  const k = req.query.k;

  client.get(k, async (err, cachedData) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro no Redis' });
    }

    if (cachedData) {
      console.log('Cache encontrado para ' + k);
      return res.json(JSON.parse(cachedData));
    }

    // não encontrado no cache
    try {
      const bios = await Bio.find({ k });
  
      for (let i = 0; i < bios.length ; i++) {
        const bio = bios[i];
        if (bio.instagram && bio.instagram !== '' && !bio.profileImageUrl) {
          bio.profileImageUrl = await getInstagramProfileMeta(bio.instagram);
        }
      }
  
      client.setex(k, 86400, JSON.stringify(bios));
      console.log('Cache não encontrado, gerando novo dado com tempo de vida de 1 dia');

      res.status(200).json(bios);
    } catch (err) {
      console.error('Erro ao buscar bios:', err);
      res.status(500).json({ error: 'Erro ao buscar bios.' });
    }
  });
});

app.delete('/api/bios', async (req, res) => {
  const k = req.query.k;
  if (k != 'uzhPyefda0TuWSv') {
    res.status(403).json();
  }
  try {
    await Bio.deleteMany();
    res.status(204).json();
  } catch (err) {
    console.error('Erro ao excluir as  bios:', err);
    res.status(500).json({ error: 'Erro ao excluir as bios.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
