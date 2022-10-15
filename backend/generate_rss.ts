import{ writeFileSync } from "fs";
import RSS from "rss";

const blog = {
    title: "Rink.Gallery Notes",
    description: "just my thoughts on different topics.",
    author: "Markus Rink",
    articles: [] //content here
};

const feed = new RSS({
    title: blog.title,
    description: blog.description,
    author: blog.author
});

for (const article of blog.articles) {
    feed.item({
        title: article.title,
        date: article.date
    });
}

const xml = feed.xml({ indent: true });
writeFileSync("feed.xml", xml);
