from django.conf import settings
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import LoginSerializer, UserSerializer


def _set_refresh_cookie(response: Response, refresh: str) -> None:
    response.set_cookie(
        key=settings.JWT_REFRESH_COOKIE_NAME,
        value=refresh,
        httponly=True,
        secure=settings.JWT_COOKIE_SECURE,
        samesite=settings.JWT_COOKIE_SAMESITE,
        path=settings.JWT_REFRESH_COOKIE_PATH,
        max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(
        key=settings.JWT_REFRESH_COOKIE_NAME,
        path=settings.JWT_REFRESH_COOKIE_PATH,
        samesite=settings.JWT_COOKIE_SAMESITE,
    )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]

        refresh = RefreshToken.for_user(user)
        access = str(refresh.access_token)

        response = Response(
            {"access": access, "user": UserSerializer(user).data},
            status=status.HTTP_200_OK,
        )
        _set_refresh_cookie(response, str(refresh))
        return response


class RefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        raw = request.COOKIES.get(settings.JWT_REFRESH_COOKIE_NAME)
        if not raw:
            return Response({"detail": "Kein Refresh-Token."}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            refresh = RefreshToken(raw)
        except TokenError as exc:
            raise InvalidToken(str(exc)) from exc

        access = str(refresh.access_token)
        response = Response({"access": access}, status=status.HTTP_200_OK)

        if settings.SIMPLE_JWT.get("ROTATE_REFRESH_TOKENS", False):
            new_refresh = str(refresh)
            _set_refresh_cookie(response, new_refresh)

        return response


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        response = Response(status=status.HTTP_204_NO_CONTENT)
        _clear_refresh_cookie(response)
        return response


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)
