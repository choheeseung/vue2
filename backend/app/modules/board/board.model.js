const boardModel = {};
boardModel.tableName = 'tbl_board';

boardModel.getBoard = async(key) => {
    let result = {};
    const db = database();

    try {
        await db(boardModel.tableName)
            .where('key', key)
            .limit(1)
            .then((rows) => {
                if (rows.length > 0 && rows[0]) {
                    result = rows[0];
                }
            })
    } catch {
        result = {};
    }
    return result;
}

boardModel.getPost = async(params) => {
    const boardKey = params?.key ?? '';

    const type = params?.type ?? 'POST';
    const parent_id = params?.parent_id ?? 0;

    const isNotice = params?.isNotice ? 'Y' : 'N';
    const searchColumn = params?.searchColumn ?? '';
    const searchQuery = params?.searchQuery ?? '';
    const page = params?.page ?? 1;
    const pageRows = params?.page_rows ?? 10;
    const start = (page - 1) * pageRows;

    const db = database();
    const t = db(boardModel.postTableName)
        .select(db.raw(`SQL_CALC_FOUND_ROWS ${boardModel.postTableName}.*`))
        .select('tbl_members.nickname AS created_user_name')
        .leftJoin('tbl_members', `${boardModel.postTableName}.created_user`, 'tbl_members.id')
        .where(`${boardModel.postTableName}.status`, 'Y')
        .where(`${boardModel.postTableName}.type`, type)
        .where(`${boardModel.postTableName}.is_notice`, isNotice);

    if (boardKey) {
        t.where(`${boardModel.postTableName}.board_key`, boardKey);
    }

    if (type === 'COMMENT') {
        t.where(`${boardModel.postTableName}.parent_id`, parent_id)
    }

    if (isNotice !== 'Y' && searchColumn && searchQuery) {
        if (searchColumn === 'title') {
            t.whereLike(`${boardModel.postTableName}.title`, searchQuery);
        } else if (searchColumn === 'author') {
            t.where('tbl_members.nickname', searchQuery);
        } else if (searchColumn === 'title+content') {
            t.where(function() {
                this.where(`${boardModel.postTableName}.title`, searchQuery)
                    .orWhere(`${boardModel.postTableName}.content`, searchQuery)
            });
        }
    }

    if (isNotice !== 'Y') {
        t.limit(pageRows).offset(start);
    }

    const result = {
        result: [],
        totalCount: 0,
    }

    t.orderBy('num', 'desc').orderBy('reply', 'asc');

    await t.then((rows) => {
        result.result = rows;
    });

    await db.raw('SELECT FOUND_ROWS() AS `cnt`')
        .then(res => {
            result.totalCount = res[0][0]?.cnt * 1 ?? 0;
        });

    for (let i = 0; i < result.result.length; i++) {
        result.result[i].num = result.totalCount - start - i;
    }

    return result;
}

boardModel.getPostOne = async(postId) => {
    let result = {};

    const db = database();
    await db
        .select(db.raw(`${boardModel.postTableName}.*`))
        .select(db.raw(`IFNULL(tbl_members.nickname, ${boardModel.postTableName}.author_name) AS created_user_name`))
        .from(boardModel.postTableName)
        .leftJoin('tbl_members', `${boardModel.postTableName}.created_user`, 'tbl_members.id')
        .where(boardModel.postTableName + '.id', postId)
        .then((rows) => {
            if (rows && rows[0]) {
                result = rows[0];
            }
        });
    return result;
}

module.exports = boardModel;