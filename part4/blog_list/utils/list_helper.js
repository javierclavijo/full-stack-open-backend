const dummy = (blogs) => {
    return 1;
}

const totalLikes = (blogs) => blogs.map(b => b.likes).reduce((a, c) => a + c, 0)

const favoriteBlog = (blogs) => {
    let blog = blogs.find(b => b.likes === Math.max(...blogs.map(b => b.likes)));
    return {title: blog.title, author: blog.author, likes: blog.likes};
}


module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
}
