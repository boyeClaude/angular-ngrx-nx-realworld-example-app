import { ArticlesService } from '../../services/articles.service';
import { ActionsService } from '../../services/actions.service';
import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, concatMap, exhaustMap, map, mergeMap, tap } from 'rxjs/operators';
import * as ArticleActions from './article.actions';
import * as ArticlesActions from '../articles.actions';

import { NgrxFormsFacade, setErrors, resetForm } from '@realworld/core/forms';
import { Router } from '@angular/router';

@Injectable()
export class ArticleEffects {
  loadArticle = createEffect(() =>
    this.actions$.pipe(
      ofType(ArticleActions.loadArticle),
      concatMap((action) =>
        this.articlesService.getArticle(action.slug).pipe(
          map((response) => ArticleActions.loadArticleSuccess({ article: response.article })),
          catchError((error) => of(ArticleActions.loadArticleFail(error))),
        ),
      ),
    ),
  );

  loadComments = createEffect(() =>
    this.actions$.pipe(
      ofType(ArticleActions.loadComments),
      concatMap((action) =>
        this.articlesService.getComments(action.slug).pipe(
          map((data) => ArticleActions.loadCommentsSuccess({ comments: data.comments })),
          catchError((error) => of(ArticleActions.loadCommentsFail(error))),
        ),
      ),
    ),
  );

  deleteArticle = createEffect(() =>
    this.actions$.pipe(
      ofType(ArticleActions.deleteArticle),
      concatMap((action) =>
        this.articlesService.deleteArticle(action.slug).pipe(
          tap((_) => this.router.navigate(['/'])),
          map((_) => ArticleActions.deleteArticleSuccess()),
          catchError((error) => of(ArticleActions.deleteArticleFail(error))),
        ),
      ),
    ),
  );

  addComment = createEffect(() =>
    this.actions$.pipe(
      ofType(ArticleActions.addComment),
      concatLatestFrom(() => this.ngrxFormsFacade.data$),
      exhaustMap(([{ slug }, data]) =>
        this.articlesService.addComment(slug, data.comment).pipe(
          mergeMap((response) => [ArticleActions.addCommentSuccess({ comment: response.comment }), resetForm()]),
          catchError((result) => of(setErrors({ errors: result.error.errors }))),
        ),
      ),
    ),
  );

  deleteComment = createEffect(() =>
    this.actions$.pipe(
      ofType(ArticleActions.deleteComment),
      concatMap((action) =>
        this.articlesService.deleteComment(action.commentId, action.slug).pipe(
          map((_) => ArticleActions.deleteCommentSuccess({ commentId: action.commentId })),
          catchError((error) => of(ArticleActions.deleteCommentFail(error))),
        ),
      ),
    ),
  );

  follow = createEffect(() =>
    this.actions$.pipe(
      ofType(ArticleActions.follow),
      concatMap(({ username }) =>
        this.actionsService.followUser(username).pipe(
          map((response) => ArticleActions.followSuccess({ profile: response.profile })),
          catchError((error) => of(ArticleActions.followFail(error))),
        ),
      ),
    ),
  );

  unFollow = createEffect(() =>
    this.actions$.pipe(
      ofType(ArticleActions.unFollow),
      concatMap(({ username }) =>
        this.actionsService.unfollowUser(username).pipe(
          map((response) => ArticleActions.unFollowSuccess({ profile: response.profile })),
          catchError((error) => of(ArticleActions.unFollowFail(error))),
        ),
      ),
    ),
  );

  favorite = createEffect(() =>
    this.actions$.pipe(
      ofType(ArticlesActions.favorite),
      concatMap(({ slug }) =>
        this.actionsService.favorite(slug).pipe(
          map((response) => ArticlesActions.favoriteSuccess({ article: response.article })),
          catchError((error) => of(ArticlesActions.favoriteFail(error))),
        ),
      ),
    ),
  );

  unFavorite = createEffect(() =>
    this.actions$.pipe(
      ofType(ArticlesActions.unFavorite),
      concatMap(({ slug }) =>
        this.actionsService.unfavorite(slug).pipe(
          map((response) => ArticlesActions.unFavoriteSuccess({ article: response.article })),
          catchError((error) => of(ArticlesActions.unFavoriteFail(error))),
        ),
      ),
    ),
  );

  constructor(
    private readonly actions$: Actions,
    private readonly articlesService: ArticlesService,
    private readonly actionsService: ActionsService,
    private readonly ngrxFormsFacade: NgrxFormsFacade,
    private readonly router: Router,
  ) {}
}
