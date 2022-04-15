-- 사용자테이블 생성
CREATE TABLE CM_USER (
    USER_ID         VARCHAR(100)    NOT NULL COMMENT '사용자 ID',
    USER_NM         VARCHAR(100)    NOT NULL COMMENT '사용자 명',
    USER_GENDER     VARCHAR(1)      COMMENT '사용자 성별',
    UNIQUE KEY CM_USER_PK ( USER_ID )
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8
COMMENT='사용자테이블'
;