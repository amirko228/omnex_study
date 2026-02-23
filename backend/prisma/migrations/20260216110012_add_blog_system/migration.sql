-- CreateTable
CREATE TABLE "blog_posts" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "cover_image" TEXT,
    "category" VARCHAR(100) NOT NULL,
    "tags" TEXT[],
    "author_id" UUID NOT NULL,
    "read_time" INTEGER NOT NULL DEFAULT 5,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "bookmarks" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_likes" (
    "id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_bookmarks" (
    "id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_views" (
    "id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "user_id" UUID,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_comments" (
    "id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "parent_id" UUID,
    "content" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "blog_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_posts_category_idx" ON "blog_posts"("category");

-- CreateIndex
CREATE INDEX "blog_posts_published_published_at_idx" ON "blog_posts"("published", "published_at");

-- CreateIndex
CREATE INDEX "blog_posts_author_id_idx" ON "blog_posts"("author_id");

-- CreateIndex
CREATE UNIQUE INDEX "blog_likes_post_id_user_id_key" ON "blog_likes"("post_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "blog_bookmarks_post_id_user_id_key" ON "blog_bookmarks"("post_id", "user_id");

-- CreateIndex
CREATE INDEX "blog_views_post_id_created_at_idx" ON "blog_views"("post_id", "created_at");

-- CreateIndex
CREATE INDEX "blog_comments_post_id_created_at_idx" ON "blog_comments"("post_id", "created_at");

-- CreateIndex
CREATE INDEX "blog_comments_user_id_idx" ON "blog_comments"("user_id");

-- CreateIndex
CREATE INDEX "blog_comments_parent_id_idx" ON "blog_comments"("parent_id");

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_likes" ADD CONSTRAINT "blog_likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_likes" ADD CONSTRAINT "blog_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_bookmarks" ADD CONSTRAINT "blog_bookmarks_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_bookmarks" ADD CONSTRAINT "blog_bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_views" ADD CONSTRAINT "blog_views_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_views" ADD CONSTRAINT "blog_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "blog_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
