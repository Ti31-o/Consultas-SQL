export interface SampleDatabase {
  id: string;
  name: string;
  description: string;
  badge: string;
  icon: string;
  schemaSql: string;
  initialSql: string;
}

export const SAMPLE_DATABASES: SampleDatabase[] = [
  {
    id: 'ecommerce',
    name: 'E-Commerce & Vendas',
    description: 'Banco de dados completo de uma loja virtual com clientes, categorias, produtos, pedidos e avaliações.',
    badge: 'Popular',
    icon: 'ShoppingCart',
    initialSql: `SELECT 
  c.nome AS cliente,
  COUNT(p.id) AS total_pedidos,
  ROUND(SUM(p.valor_total), 2) AS gasto_total,
  ROUND(AVG(p.valor_total), 2) AS ticket_medio
FROM clientes c
LEFT JOIN pedidos p ON c.id = p.cliente_id
GROUP BY c.id, c.nome
ORDER BY gasto_total DESC;`,
    schemaSql: `
PRAGMA foreign_keys = ON;

CREATE TABLE clientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL,
  data_cadastro DATE NOT NULL,
  saldo_pontos INTEGER DEFAULT 0
);

CREATE TABLE categorias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  descricao TEXT
);

CREATE TABLE produtos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  categoria_id INTEGER NOT NULL REFERENCES categorias(id),
  preco REAL NOT NULL,
  custo REAL NOT NULL,
  estoque INTEGER NOT NULL,
  avaliacao_media REAL DEFAULT 5.0
);

CREATE TABLE pedidos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id),
  data_pedido DATETIME NOT NULL,
  valor_total REAL NOT NULL,
  status TEXT CHECK (status IN ('pendente', 'pago', 'enviado', 'entregue', 'cancelado')),
  metodo_pagamento TEXT CHECK (metodo_pagamento IN ('pix', 'cartao_credito', 'boleto', 'vale_presente')),
  cupom_desconto TEXT
);

CREATE TABLE itens_pedido (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  produto_id INTEGER NOT NULL REFERENCES produtos(id),
  quantidade INTEGER NOT NULL,
  preco_unitario REAL NOT NULL,
  desconto REAL DEFAULT 0.0
);

CREATE TABLE avaliacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  produto_id INTEGER NOT NULL REFERENCES produtos(id),
  cliente_id INTEGER NOT NULL REFERENCES clientes(id),
  nota INTEGER CHECK (nota BETWEEN 1 AND 5),
  comentario TEXT,
  data_avaliacao DATE NOT NULL
);

-- Inserção de Categorias
INSERT INTO categorias (id, nome, descricao) VALUES
(1, 'Eletrônicos', 'Smartphones, notebooks, fones e acessórios tecnológicos'),
(2, 'Livros & Educação', 'Literatura, desenvolvimento pessoal e livros técnicos de programação'),
(3, 'Móveis & Decoração', 'Cadeiras ergonômicas, mesas de escritório e iluminação'),
(4, 'Roupas & Moda', 'Vestuário casual, esportivo e calçados'),
(5, 'Esportes & Lazer', 'Equipamentos para academia, ciclismo e camping');

-- Inserção de Clientes
INSERT INTO clientes (id, nome, email, cidade, estado, data_cadastro, saldo_pontos) VALUES
(1, 'Ana Clara Silva', 'ana.clara@email.com', 'São Paulo', 'SP', '2023-01-15', 350),
(2, 'Bruno Henrique Costa', 'bruno.costa@email.com', 'Rio de Janeiro', 'RJ', '2023-02-20', 120),
(3, 'Camila Rodrigues', 'camila.rodrigues@email.com', 'Belo Horizonte', 'MG', '2023-03-10', 890),
(4, 'Diego Ferreira', 'diego.f@email.com', 'Curitiba', 'PR', '2023-04-05', 0),
(5, 'Eduarda Lima', 'eduarda.lima@email.com', 'Porto Alegre', 'RS', '2023-05-18', 420),
(6, 'Felipe Santos', 'felipe.santos@email.com', 'Salvador', 'BA', '2023-06-22', 210),
(7, 'Gabriela Rocha', 'gabi.rocha@email.com', 'Recife', 'PE', '2023-07-09', 1500),
(8, 'Hugo Albuquerque', 'hugo.a@email.com', 'Fortaleza', 'CE', '2023-08-30', 50),
(9, 'Isabela Mendes', 'isabela.m@email.com', 'Florianópolis', 'SC', '2023-09-14', 600),
(10, 'João Pedro Neves', 'joao.pedro@email.com', 'Brasília', 'DF', '2023-10-01', 95);

-- Inserção de Produtos
INSERT INTO produtos (id, nome, categoria_id, preco, custo, estoque, avaliacao_media) VALUES
(1, 'Notebook Pro Developer 16GB', 1, 4899.90, 3400.00, 15, 4.8),
(2, 'Mouse Ergonômico Sem Fio', 1, 149.90, 65.00, 80, 4.6),
(3, 'Teclado Mecânico RGB Switch Marrom', 1, 389.00, 180.00, 45, 4.9),
(4, 'Monitor Ultrawide 29 Polegadas', 1, 1299.00, 850.00, 20, 4.7),
(5, 'Clean Code: Habilidades Práticas do Agile', 2, 89.90, 40.00, 120, 4.9),
(6, 'SQL Para Análise de Dados: Guia Completo', 2, 75.00, 32.00, 95, 4.8),
(7, 'Entendendo Algoritmos Ilustrado', 2, 69.90, 30.00, 60, 4.9),
(8, 'Cadeira Gamer Ergonômica Reclinável', 3, 980.00, 520.00, 18, 4.5),
(9, 'Mesa com Regulagem de Altura Elétrica', 3, 2199.00, 1300.00, 8, 4.9),
(10, 'Luminária de Mesa LED Articulada', 3, 119.90, 48.00, 50, 4.3),
(11, 'Camiseta Algodão Egípcio Minimalista', 4, 89.00, 35.00, 150, 4.4),
(12, 'Tênis Esportivo Running Amortecedor', 4, 349.90, 160.00, 40, 4.6),
(13, 'Bicicleta Mountain Bike Aro 29', 5, 1899.00, 1150.00, 12, 4.7),
(14, 'Kit Halteres Reguláveis 20kg', 5, 279.00, 130.00, 35, 4.8),
(15, 'Garrafa Térmica Inox 1L', 5, 89.90, 38.00, 90, 4.7);

-- Inserção de Pedidos
INSERT INTO pedidos (id, cliente_id, data_pedido, valor_total, status, metodo_pagamento, cupom_desconto) VALUES
(1, 1, '2024-01-10 14:22:00', 5049.80, 'entregue', 'pix', 'BEMVINDO10'),
(2, 2, '2024-01-15 09:30:00', 149.90, 'entregue', 'cartao_credito', NULL),
(3, 3, '2024-01-20 18:45:00', 2348.90, 'entregue', 'pix', NULL),
(4, 1, '2024-02-05 11:15:00', 234.80, 'entregue', 'cartao_credito', 'TECH10'),
(5, 5, '2024-02-12 16:00:00', 1299.00, 'entregue', 'pix', NULL),
(6, 7, '2024-02-28 20:10:00', 4899.90, 'entregue', 'cartao_credito', 'VIP500'),
(7, 3, '2024-03-02 10:05:00', 438.90, 'entregue', 'pix', NULL),
(8, 6, '2024-03-14 13:40:00', 368.90, 'enviado', 'boleto', NULL),
(9, 7, '2024-03-22 17:25:00', 1899.00, 'enviado', 'pix', NULL),
(10, 8, '2024-03-25 08:12:00', 89.90, 'cancelado', 'boleto', NULL),
(11, 9, '2024-04-01 19:33:00', 1388.90, 'pago', 'cartao_credito', 'PROMOABRIL'),
(12, 10, '2024-04-05 15:50:00', 389.00, 'pendente', 'pix', NULL),
(13, 2, '2024-04-10 12:00:00', 69.90, 'entregue', 'pix', NULL),
(14, 5, '2024-04-18 17:15:00', 279.00, 'entregue', 'cartao_credito', NULL),
(15, 7, '2024-04-22 09:44:00', 3179.00, 'pago', 'pix', 'SUPERDESCONTO');

-- Itens dos Pedidos
INSERT INTO itens_pedido (id, pedido_id, produto_id, quantidade, preco_unitario, desconto) VALUES
(1, 1, 1, 1, 4899.90, 0),
(2, 1, 2, 1, 149.90, 0),
(3, 2, 2, 1, 149.90, 0),
(4, 3, 9, 1, 2199.00, 0),
(5, 3, 2, 1, 149.90, 0),
(6, 4, 5, 1, 89.90, 0),
(7, 4, 6, 1, 75.00, 0),
(8, 4, 7, 1, 69.90, 0),
(9, 5, 4, 1, 1299.00, 0),
(10, 6, 1, 1, 4899.90, 500),
(11, 7, 3, 1, 389.00, 0),
(12, 7, 11, 1, 89.00, 39.10),
(13, 8, 12, 1, 349.90, 0),
(14, 9, 13, 1, 1899.00, 0),
(15, 10, 5, 1, 89.90, 0),
(16, 11, 4, 1, 1299.00, 0),
(17, 11, 11, 1, 89.90, 0),
(18, 12, 3, 1, 389.00, 0),
(19, 13, 7, 1, 69.90, 0),
(20, 14, 14, 1, 279.00, 0),
(21, 15, 9, 1, 2199.00, 0),
(22, 15, 8, 1, 980.00, 0);

-- Avaliações
INSERT INTO avaliacoes (id, produto_id, cliente_id, nota, comentario, data_avaliacao) VALUES
(1, 1, 1, 5, 'Excelente para compilar código e rodar containers docker!', '2024-01-20'),
(2, 2, 1, 4, 'Muito confortável, a bateria dura semanas.', '2024-01-22'),
(3, 2, 2, 5, 'Melhor mouse que já comprei para produtividade.', '2024-01-25'),
(4, 9, 3, 5, 'Mudou minha postura e disposição no home office.', '2024-01-30'),
(5, 5, 1, 5, 'Leitura obrigatória para qualquer programador.', '2024-02-15'),
(6, 6, 1, 5, 'Explicações práticas com queries reais.', '2024-02-16'),
(7, 4, 5, 5, 'Espaço de tela incrível para dividir abas de IDE.', '2024-02-25'),
(8, 1, 7, 5, 'Máquina potente e silenciosa. Super recomendo.', '2024-03-10'),
(9, 3, 3, 5, 'Os switches são suaves e muito gostosos de digitar.', '2024-03-12'),
(10, 13, 7, 4, 'Bicicleta robusta e câmbio bem ajustado.', '2024-04-02');
`
  },
  {
    id: 'hr_corp',
    name: 'RH & Gestão TechCorp',
    description: 'Gestão de recursos humanos, departamentos, cargos, salários e alocação de equipes em projetos.',
    badge: 'Corporativo',
    icon: 'Briefcase',
    initialSql: `SELECT 
  d.nome AS departamento,
  COUNT(f.id) AS total_funcionarios,
  ROUND(AVG(f.salario), 2) AS media_salarial,
  ROUND(SUM(f.salario), 2) AS folha_total,
  MAX(f.salario) AS maior_salario
FROM departamentos d
LEFT JOIN funcionarios f ON d.id = f.departamento_id
GROUP BY d.id, d.nome
ORDER BY folha_total DESC;`,
    schemaSql: `
PRAGMA foreign_keys = ON;

CREATE TABLE departamentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  sigla TEXT NOT NULL UNIQUE,
  orcamento_anual REAL NOT NULL,
  localizacao TEXT NOT NULL
);

CREATE TABLE cargos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  nivel TEXT CHECK (nivel IN ('Junior', 'Pleno', 'Senior', 'Especialista', 'Lideranca')),
  salario_base REAL NOT NULL,
  departamento_id INTEGER NOT NULL REFERENCES departamentos(id)
);

CREATE TABLE funcionarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  cargo_id INTEGER NOT NULL REFERENCES cargos(id),
  departamento_id INTEGER NOT NULL REFERENCES departamentos(id),
  salario REAL NOT NULL,
  data_admissao DATE NOT NULL,
  status TEXT CHECK (status IN ('ativo', 'ferias', 'afastado', 'desligado'))
);

CREATE TABLE projetos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  departamento_id INTEGER NOT NULL REFERENCES departamentos(id),
  orcamento REAL NOT NULL,
  prazo_meses INTEGER NOT NULL,
  status TEXT CHECK (status IN ('planejamento', 'em_andamento', 'concluido', 'pausado'))
);

CREATE TABLE alocacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  funcionario_id INTEGER NOT NULL REFERENCES funcionarios(id),
  projeto_id INTEGER NOT NULL REFERENCES projetos(id),
  horas_semanais INTEGER NOT NULL,
  papel TEXT NOT NULL
);

INSERT INTO departamentos (id, nome, sigla, orcamento_anual, localizacao) VALUES
(1, 'Engenharia de Software', 'ENG', 2500000.00, 'São Paulo - Andar 8'),
(2, 'Ciência de Dados & IA', 'DATA', 1800000.00, 'São Paulo - Andar 9'),
(3, 'Design de Produto & UX', 'UX', 900000.00, 'Remoto'),
(4, 'Marketing & Crescimento', 'MKT', 1200000.00, 'Rio de Janeiro'),
(5, 'Recursos Humanos & Pessoas', 'RH', 650000.00, 'São Paulo - Andar 2');

INSERT INTO cargos (id, titulo, nivel, salario_base, departamento_id) VALUES
(1, 'Engenheiro de Software Frontend', 'Pleno', 7500.00, 1),
(2, 'Engenheiro de Software Backend', 'Senior', 12500.00, 1),
(3, 'Arquiteto de Soluções Cloud', 'Especialista', 16500.00, 1),
(4, 'Cientista de Dados', 'Senior', 13000.00, 2),
(5, 'Engenheiro de Machine Learning', 'Pleno', 9000.00, 2),
(6, 'Designer UX/UI', 'Pleno', 7200.00, 3),
(7, 'Gerente de Produto (PM)', 'Lideranca', 15000.00, 1),
(8, 'Analista de Growth Marketing', 'Pleno', 6000.00, 4),
(9, 'Especialista em Gente & Gestão', 'Senior', 8500.00, 5);

INSERT INTO funcionarios (id, nome, email, cargo_id, departamento_id, salario, data_admissao, status) VALUES
(1, 'Rodrigo Meireles', 'rodrigo.m@techcorp.io', 3, 1, 17500.00, '2021-03-01', 'ativo'),
(2, 'Larissa Valente', 'larissa.v@techcorp.io', 2, 1, 13200.00, '2022-01-15', 'ativo'),
(3, 'Gabriel Nogueira', 'gabriel.n@techcorp.io', 1, 1, 8000.00, '2023-05-10', 'ativo'),
(4, 'Tatiane Pires', 'tatiane.p@techcorp.io', 7, 1, 15500.00, '2021-08-20', 'ativo'),
(5, 'Lucas Siqueira', 'lucas.s@techcorp.io', 4, 2, 14000.00, '2022-03-12', 'ativo'),
(6, 'Juliana Fontes', 'juliana.f@techcorp.io', 5, 2, 9500.00, '2023-02-01', 'ativo'),
(7, 'Mateus Barreto', 'mateus.b@techcorp.io', 6, 3, 7600.00, '2022-11-10', 'ativo'),
(8, 'Carolina Prado', 'carolina.p@techcorp.io', 8, 4, 6400.00, '2023-04-18', 'ativo'),
(9, 'Bernardo Leite', 'bernardo.l@techcorp.io', 9, 5, 8900.00, '2020-09-01', 'ativo'),
(10, 'Amanda Castello', 'amanda.c@techcorp.io', 1, 1, 7800.00, '2023-08-15', 'ferias'),
(11, 'Vitor Fagundes', 'vitor.f@techcorp.io', 2, 1, 12800.00, '2022-06-01', 'ativo'),
(12, 'Priscila Dorneles', 'priscila.d@techcorp.io', 4, 2, 13500.00, '2022-09-15', 'ativo');

INSERT INTO projetos (id, nome, departamento_id, orcamento, prazo_meses, status) VALUES
(1, 'Migração Core para Microserviços', 1, 450000.00, 12, 'em_andamento'),
(2, 'Motor de Recomendação Personalizada com IA', 2, 380000.00, 8, 'em_andamento'),
(3, 'Redesign Completo do App Mobile', 3, 160000.00, 6, 'concluido'),
(4, 'Automação de Pipelines CI/CD e FinOps', 1, 120000.00, 4, 'em_andamento'),
(5, 'Campanha Omnichannel Black Friday', 4, 290000.00, 5, 'planejamento');

INSERT INTO alocacoes (id, funcionario_id, projeto_id, horas_semanais, papel) VALUES
(1, 1, 1, 20, 'Líder Técnico & Arquiteto'),
(2, 2, 1, 40, 'Backend Lead'),
(3, 3, 1, 40, 'Frontend Developer'),
(4, 4, 1, 15, 'Product Manager'),
(5, 5, 2, 30, 'Lead Data Scientist'),
(6, 6, 2, 40, 'ML Engineer'),
(7, 7, 3, 35, 'Lead UI/UX'),
(8, 1, 4, 15, 'Consultor DevOps'),
(9, 11, 4, 30, 'DevOps Engineer'),
(10, 8, 5, 40, 'Growth Lead');
`
  },
  {
    id: 'cinestream',
    name: 'CineStream & Cinema',
    description: 'Catálogo de filmes, diretores, atores, avaliações IMDb e histórico de visualizações por assinantes.',
    badge: 'Entretenimento',
    icon: 'Film',
    initialSql: `SELECT 
  f.titulo,
  f.ano_lancamento,
  g.nome AS genero,
  f.nota_imdb,
  f.bilheteria_milhoes - f.orcamento_milhoes AS lucro_milhoes
FROM filmes f
JOIN generos g ON f.genero_id = g.id
ORDER BY f.nota_imdb DESC
LIMIT 10;`,
    schemaSql: `
PRAGMA foreign_keys = ON;

CREATE TABLE generos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL UNIQUE
);

CREATE TABLE filmes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  ano_lancamento INTEGER NOT NULL,
  duracao_minutos INTEGER NOT NULL,
  nota_imdb REAL NOT NULL,
  genero_id INTEGER NOT NULL REFERENCES generos(id),
  orcamento_milhoes REAL NOT NULL,
  bilheteria_milhoes REAL NOT NULL
);

CREATE TABLE atores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  nacionalidade TEXT NOT NULL,
  ano_nascimento INTEGER NOT NULL
);

CREATE TABLE elenco (
  filme_id INTEGER NOT NULL REFERENCES filmes(id),
  ator_id INTEGER NOT NULL REFERENCES atores(id),
  personagem TEXT NOT NULL,
  PRIMARY KEY (filme_id, ator_id)
);

CREATE TABLE assinantes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  plano TEXT CHECK (plano IN ('basico', 'padrao_hd', 'premium_4k')),
  pais TEXT NOT NULL,
  ativo INTEGER DEFAULT 1
);

CREATE TABLE reproducoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assinante_id INTEGER NOT NULL REFERENCES assinantes(id),
  filme_id INTEGER NOT NULL REFERENCES filmes(id),
  minutos_assistidos INTEGER NOT NULL,
  concluido INTEGER DEFAULT 0,
  data_hora DATETIME NOT NULL
);

INSERT INTO generos (id, nome) VALUES
(1, 'Ficção Científica'),
(2, 'Drama'),
(3, 'Ação & Aventura'),
(4, 'Suspense & Mistério'),
(5, 'Comédia'),
(6, 'Animação');

INSERT INTO filmes (id, titulo, ano_lancamento, duracao_minutos, nota_imdb, genero_id, orcamento_milhoes, bilheteria_milhoes) VALUES
(1, 'Interestelar', 2014, 169, 8.7, 1, 165.0, 773.8),
(2, 'A Origem (Inception)', 2010, 148, 8.8, 1, 160.0, 836.8),
(3, 'O Poderoso Chefão', 1972, 175, 9.2, 2, 6.0, 250.0),
(4, 'Batman: O Cavaleiro das Trevas', 2008, 152, 9.0, 3, 185.0, 1006.0),
(5, 'Parasita', 2019, 132, 8.5, 4, 11.4, 263.0),
(6, 'Pulp Fiction: Tempo de Violência', 1994, 154, 8.9, 2, 8.5, 213.9),
(7, 'Matrix', 1999, 136, 8.7, 1, 63.0, 467.2),
(8, 'Gladiador', 2000, 155, 8.5, 3, 103.0, 503.2),
(9, 'Whiplash: Em Busca da Perfeição', 2014, 106, 8.5, 2, 3.3, 49.4),
(10, 'Homem-Aranha no Aranhaverso', 2018, 117, 8.4, 6, 90.0, 384.3);

INSERT INTO atores (id, nome, nacionalidade, ano_nascimento) VALUES
(1, 'Matthew McConaughey', 'Estados Unidos', 1969),
(2, 'Anne Hathaway', 'Estados Unidos', 1982),
(3, 'Leonardo DiCaprio', 'Estados Unidos', 1974),
(4, 'Joseph Gordon-Levitt', 'Estados Unidos', 1981),
(5, 'Christian Bale', 'Reino Unido', 1974),
(6, 'Heath Ledger', 'Austrália', 1979),
(7, 'Keanu Reeves', 'Canadá', 1964),
(8, 'Song Kang-ho', 'Coreia do Sul', 1967),
(9, 'Russell Crowe', 'Nova Zelândia', 1964),
(10, 'Miles Teller', 'Estados Unidos', 1987);

INSERT INTO elenco (filme_id, ator_id, personagem) VALUES
(1, 1, 'Cooper'),
(1, 2, 'Brand'),
(2, 3, 'Dom Cobb'),
(2, 4, 'Arthur'),
(4, 5, 'Bruce Wayne / Batman'),
(4, 6, 'Coringa (Joker)'),
(7, 7, 'Neo / Thomas Anderson'),
(5, 8, 'Kim Ki-taek'),
(8, 9, 'Maximus Decimus Meridius'),
(9, 10, 'Andrew Neiman');

INSERT INTO assinantes (id, nome, plano, pais, ativo) VALUES
(1, 'Marcos Vinicius', 'premium_4k', 'Brasil', 1),
(2, 'Sofia Alcantara', 'padrao_hd', 'Brasil', 1),
(3, 'Carlos Gutierrez', 'premium_4k', 'Argentina', 1),
(4, 'Elena Duarte', 'basico', 'Portugal', 1),
(5, 'Lucas Morais', 'padrao_hd', 'Brasil', 0),
(6, 'Mariana Costa', 'premium_4k', 'Brasil', 1);

INSERT INTO reproducoes (id, assinante_id, filme_id, minutos_assistidos, concluido, data_hora) VALUES
(1, 1, 1, 169, 1, '2024-04-01 20:15:00'),
(2, 1, 2, 148, 1, '2024-04-03 21:00:00'),
(3, 2, 4, 152, 1, '2024-04-05 19:30:00'),
(4, 3, 5, 132, 1, '2024-04-06 22:10:00'),
(5, 4, 10, 60, 0, '2024-04-08 18:00:00'),
(6, 6, 1, 169, 1, '2024-04-10 14:00:00'),
(7, 6, 9, 106, 1, '2024-04-11 23:15:00');
`
  },
  {
    id: 'scratchpad',
    name: 'Banco Vazio (Scratchpad)',
    description: 'Um banco em branco pronto para você executar seus próprios comandos DDL e DML.',
    badge: 'Em Branco',
    icon: 'Database',
    initialSql: `-- Crie suas próprias tabelas e execute queries livres!
CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO usuarios (nome, email) VALUES
('Alan Turing', 'alan@turing.org'),
('Ada Lovelace', 'ada@lovelace.io'),
('Grace Hopper', 'grace@navy.mil');

SELECT * FROM usuarios;`,
    schemaSql: `-- Banco em branco. Crie tabelas livremente com o editor SQL.`
  }
];
