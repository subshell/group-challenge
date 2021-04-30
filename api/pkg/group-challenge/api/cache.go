package api

import (
	"group-challenge/pkg/group-challenge/models"
	"time"

	"github.com/patrickmn/go-cache"
)

// TODO allow other types (not only models.Image)
type memoryCacheLoaderFn = func(id string) (*models.Image, error)

type memoryCache struct {
	dataCache *cache.Cache
	loaderFn  memoryCacheLoaderFn
}

func newCache(defaultExpiration time.Duration, cleanupInterval time.Duration, loaderFn memoryCacheLoaderFn) *memoryCache {
	return &memoryCache{
		dataCache: cache.New(defaultExpiration, cleanupInterval),
		loaderFn:  loaderFn,
	}
}

func (memoryCache *memoryCache) load(key string) (*models.Image, error) {
	if data, found := memoryCache.dataCache.Get(key); found {
		return data.(*models.Image), nil
	}

	data, err := memoryCache.loaderFn(key)
	if err != nil {
		return nil, err
	}

	memoryCache.dataCache.Add(key, data, cache.DefaultExpiration)

	return data, nil
}
