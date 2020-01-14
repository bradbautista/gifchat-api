function makeArticlesArray() {
  return [
    {
      id: 1,
      date_published: '2029-01-22T16:28:32.615Z',
      title: 'First test post!',
      style: 'How-to',
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
      author: 1
    },
    {
      id: 2,
      date_published: '2100-05-22T16:28:32.615Z',
      title: 'Second test post!',
      style: 'News',
      content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum, exercitationem cupiditate dignissimos est perspiciatis, nobis commodi alias saepe atque facilis labore sequi deleniti. Sint, adipisci facere! Velit temporibus debitis rerum.',
      author: 1
    },
    {
      id: 3,
      date_published: '1919-12-22T16:28:32.615Z',
      title: 'Third test post!',
      style: 'Listicle',
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Possimus, voluptate? Necessitatibus, reiciendis? Cupiditate totam laborum esse animi ratione ipsa dignissimos laboriosam eos similique cumque. Est nostrum esse porro id quaerat.',
      author: 1
    },
    {
      id: 4,
      date_published: '1919-12-22T16:28:32.615Z',
      title: 'Fourth test post!',
      style: 'Story',
      content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Earum molestiae accusamus veniam consectetur tempora, corporis obcaecati ad nisi asperiores tenetur, autem magnam. Iste, architecto obcaecati tenetur quidem voluptatum ipsa quam?',
      author: 1
    },
  ];
}

function makeMaliciousArticle() {
  const maliciousArticle = {
    id: 911,
    style: 'How-to',
    date_published: new Date().toISOString(),
    title: 'Naughty naughty very naughty <script>alert("xss");</script>',
    content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`
  }
  const expectedArticle = {
    ...maliciousArticle,
    title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
  }
  return {
    maliciousArticle,
    expectedArticle,
  }
}

module.exports = {
  makeArticlesArray,
  makeMaliciousArticle,
}